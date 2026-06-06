// DTOs and Validation demo — Go (Gin framework)
//
// Demonstrates boundary validation in Go: no decorator system exists, so all constraints
// are checked manually against a parsed map before any user is created.
// go-playground/validator struct tags are not used here to keep the validation logic
// explicit and easy to read — the principle (check at boundary, collect errors, reject
// with 400 + error array before business logic) is the same across all language demos.
// The in-memory slice of User structs replaces a real database.
package main

import (
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// User represents a user record stored in the in-memory slice and returned in API responses.
// JSON tags control the field names in the serialised output.
type User struct {
	ID      string   `json:"id"`      // Short unique identifier (6 alphanumeric chars).
	Name    string   `json:"name"`    // Validated display name (min 3 chars).
	Email   string   `json:"email"`   // Validated email (must contain "@").
	Age     int      `json:"age"`     // Validated age integer in [18, 100].
	Address *Address `json:"address"` // Optional nested address; nil when absent.
}

// Address is the optional nested postal address sub-object.
// It is a pointer in User so it serialises to JSON null when absent.
type Address struct {
	City string `json:"city"` // City or locality name (2-100 chars).
	Zip  string `json:"zip"`  // ZIP code matching ^\d{4,10}$.
}

// users is the in-memory store — a slice that resets on restart.
// In production this would be replaced by a database call.
var users = []User{}

// letters is the character set for generated ids (lowercase a-z + 0-9).
var letters = []rune("abcdefghijklmnopqrstuvwxyz0123456789")

// nextUniqueShortId generates a collision-free 6-character alphanumeric id.
// It retries indefinitely until a candidate not already in users is found.
// In practice collisions are astronomically rare for a demo-sized store.
func nextUniqueShortId() string {
	// Seed with the current time to avoid repeating sequences across restarts.
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for {
		// Build a 6-character random string from the allowed character set.
		b := make([]rune, 6)
		for i := range b {
			b[i] = letters[r.Intn(len(letters))]
		}
		candidate := string(b)

		// Linear scan of the store to check for collisions — acceptable for a demo.
		exists := false
		for _, u := range users {
			if u.ID == candidate {
				exists = true
				break
			}
		}
		if !exists {
			// Found a free id — return it.
			return candidate
		}
	}
}

func main() {
	// r is the Gin router with the default logger and recovery middleware.
	r := gin.Default()

	// POST /users — validate the body at the boundary and create a user on success.
	r.POST("/users", func(c *gin.Context) {
		// Decode the JSON body into a generic map.
		// Using map[string]interface{} (instead of a struct) lets us inspect each
		// field's Go type independently, enabling accurate error messages.
		var payload map[string]interface{}
		if err := c.ShouldBindJSON(&payload); err != nil {
			// On parse failure treat all fields as absent; the validation below will catch them.
			payload = make(map[string]interface{})
		}

		// messages collects every constraint violation found in this request.
		// All errors are gathered before returning so the client sees the full picture.
		var messages []string

		// --- Validate name ---
		nameVal, nameExists := payload["name"]
		nameStr, nameIsStr := nameVal.(string)
		if !nameExists || !nameIsStr {
			// name is missing or not a string — report type and min-length errors together.
			messages = append(messages, "name must be a string", "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)")
		} else if len(nameStr) < 3 {
			// name is a string but shorter than the 3-character minimum.
			messages = append(messages, "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)")
		}

		// --- Validate email ---
		emailVal, emailExists := payload["email"]
		emailStr, emailIsStr := emailVal.(string)
		// Simple "@" presence check — sufficient for the demo.
		containsAt := false
		if emailIsStr {
			for _, char := range emailStr {
				if char == '@' {
					containsAt = true
					break
				}
			}
		}
		if !emailExists || !emailIsStr || !containsAt {
			messages = append(messages, "Email không hợp lệ (EN: Invalid email)")
		}

		// --- Validate age ---
		ageVal, ageExists := payload["age"]
		if !ageExists {
			// age is completely absent from the payload.
			messages = append(messages, "age must be an integer number", "age must not be less than 18", "age must not be greater than 100")
		} else {
			// JSON numbers arrive as float64 in Go's generic map; int/int64 are also handled
			// for robustness although standard JSON encoding always produces float64.
			var val float64
			var isNum bool
			switch v := ageVal.(type) {
			case float64:
				val = v
				isNum = true
			case int:
				val = float64(v)
				isNum = true
			case int64:
				val = float64(v)
				isNum = true
			}

			if !isNum {
				// age is present but not a numeric type.
				messages = append(messages, "age must be an integer number", "age must not be less than 18", "age must not be greater than 100")
			} else {
				// Reject fractional values (e.g. 25.5) — age must be a whole number.
				isInteger := val == float64(int(val))
				if !isInteger {
					messages = append(messages, "age must be an integer number")
				}
				// Check lower bound.
				if val < 18 {
					messages = append(messages, "age must not be less than 18")
				}
				// Check upper bound.
				if val > 100 {
					messages = append(messages, "age must not be greater than 100")
				}
			}
		}

		// --- Validate address (optional nested object) ---
		addressVal, addressExists := payload["address"]
		var addressObj *Address
		if addressExists && addressVal != nil {
			if addrMap, ok := addressVal.(map[string]interface{}); ok {
				// Validate nested city — must be a string of 2-100 characters.
				cityVal, cityExists := addrMap["city"]
				cityStr, cityIsStr := cityVal.(string)
				if !cityExists || !cityIsStr || len(cityStr) < 2 || len(cityStr) > 100 {
					messages = append(messages, "address.City phải dài 2-100 ký tự (EN: city must be 2-100 chars)")
				}

				// Validate nested zip — must match 4-10 digit regex.
				zipVal, zipExists := addrMap["zip"]
				zipStr, zipIsStr := zipVal.(string)
				matched, _ := regexp.MatchString(`^\d{4,10}$`, zipStr)
				if !zipExists || !zipIsStr || !matched {
					// "address." prefix in the message mirrors the nested path convention
					// used by NestJS ValidationPipe for consistent error reporting across langs.
					messages = append(messages, "address.ZIP phải gồm 4-10 chữ số (EN: ZIP must be 4-10 digits)")
				}

				// Only build the Address struct when no errors exist so far;
				// if validation failed we never reach the persist step anyway.
				if len(messages) == 0 {
					addressObj = &Address{
						City: cityStr,
						Zip:  zipStr,
					}
				}
			} else {
				// address was provided but is not a JSON object.
				messages = append(messages, "address must be an object")
			}
		}

		// --- Boundary gate: reject immediately if any error exists ---
		if len(messages) > 0 {
			// Return 400 with the full error list — no user is created.
			c.JSON(http.StatusBadRequest, gin.H{
				"statusCode": http.StatusBadRequest,
				"message":    messages,
				"error":      "Bad Request",
			})
			return
		}

		// --- All constraints passed — persist the new user ---

		// Convert age from float64 (JSON default) to int for the User struct.
		var ageInt int
		switch v := ageVal.(type) {
		case float64:
			ageInt = int(v)
		case int:
			ageInt = v
		}

		user := User{
			ID:      nextUniqueShortId(),
			Name:    nameStr,
			Email:   emailStr,
			Age:     ageInt,
			Address: addressObj, // nil when the client did not supply an address.
		}
		// Append to the global in-memory slice.
		users = append(users, user)

		// Return 201 Created with the full user record.
		c.JSON(http.StatusCreated, user)
	})

	// GET /users — return a paginated list of users sorted by id.
	r.GET("/users", func(c *gin.Context) {
		// Read pagination params from the query string; default to page=1, limit=10.
		pageStr := c.DefaultQuery("page", "1")
		limitStr := c.DefaultQuery("limit", "10")

		// strconv.Atoi converts the query-string value to int — the equivalent of
		// @Type(() => Number) + transform:true in NestJS.
		page, err := strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			page = 1 // Fall back to default on invalid or missing value.
		}
		limit, err := strconv.Atoi(limitStr)
		if err != nil || limit < 1 {
			limit = 10 // Fall back to default on invalid or missing value.
		}

		// Sort the store by id to make pagination deterministic.
		sort.Slice(users, func(i, j int) bool {
			return users[i].ID < users[j].ID
		})

		// Compute the zero-based start index from the 1-based page number.
		startIndex := (page - 1) * limit
		if startIndex >= len(users) {
			// Requested page is beyond the last item — return an empty array.
			c.JSON(http.StatusOK, []User{})
			return
		}

		// Clamp end index to avoid a slice-out-of-bounds panic on the last page.
		endIndex := startIndex + limit
		if endIndex > len(users) {
			endIndex = len(users)
		}

		c.JSON(http.StatusOK, users[startIndex:endIndex])
	})

	// Read the port from the PORT environment variable; default to 3000.
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	// Bind to all interfaces (0.0.0.0) so the server is reachable from outside.
	r.Run(":" + port)
}
