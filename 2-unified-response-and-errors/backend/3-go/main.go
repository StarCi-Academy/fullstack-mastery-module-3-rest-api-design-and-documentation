// Package main implements the unified response & errors lesson using Go + Gin.
//
// Demonstrates the unified output contract:
//   - Success envelope: { statusCode, message, data, timestamp }
//   - Error envelope:   { statusCode, error, message, details?, timestamp, path }
//
// Go's encoding/json marshals map[string]interface{} keys in alphabetical order,
// so the actual JSON field order differs from the documented examples — the field
// set is identical, only the order varies.  Clients must not rely on key order.
package main

import (
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// User represents a user in the in-memory store.
// json tags control JSON field names (lowercase, matching the API contract).
type User struct {
	ID   int    `json:"id"`   // monotonic identifier
	Name string `json:"name"` // display name (≥ 3 characters)
}

// users is the in-memory user store, pre-seeded with one demo entry.
// All route handlers share this slice; for this single-process demo there is no
// concurrent write protection (add a sync.Mutex for production use).
var users = []User{
	{ID: 1, Name: "John Doe"},
}

// nextId is a monotonic counter for assigning IDs to new users.
// Starts at 2 because ID 1 is already taken by the seed data.
var nextId = 2

// getISO8601Timestamp returns the current UTC time in ISO 8601 format.
// The reference time "2006-01-02T15:04:05.000Z" is Go's fixed reference moment
// (Mon Jan 2 15:04:05 MST 2006) formatted to produce millisecond-precision output.
func getISO8601Timestamp() string {
	return time.Now().UTC().Format("2006-01-02T15:04:05.000Z")
}

// main initializes the Gin router, registers routes, and starts the HTTP server.
// The PORT environment variable controls the listen port (default: 3000).
func main() {
	r := gin.Default()

	// NoRoute handler: catches requests that match no registered route (HTTP 404).
	// Returns a "Cannot METHOD PATH" message to mirror NestJS / Express behaviour.
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"statusCode": http.StatusNotFound,
			"error":      "NotFoundException",
			// "Cannot METHOD PATH" is the idiomatic unmatched-route message.
			"message":   "Cannot " + c.Request.Method + " " + c.Request.URL.Path,
			"timestamp": getISO8601Timestamp(),
			"path":      c.Request.URL.Path,
		})
	})

	// GET /users — return all users sorted by ID in the success envelope.
	r.GET("/users", func(c *gin.Context) {
		// Sort in-place before responding so the order is deterministic across requests.
		sort.Slice(users, func(i, j int) bool {
			return users[i].ID < users[j].ID
		})
		c.JSON(http.StatusOK, gin.H{
			"statusCode": http.StatusOK,
			"message":    "Lấy danh sách thành công (EN: Get all success)",
			"data":       users,
			"timestamp":  getISO8601Timestamp(),
		})
	})

	// GET /users/:id — look up a user by numeric id.
	// Returns 404 error envelope for non-numeric ids or missing users.
	r.GET("/users/:id", func(c *gin.Context) {
		idStr := c.Param("id")  // raw string from the URL path

		// strconv.Atoi returns an error for non-numeric strings (e.g. "boom").
		// Treat non-numeric ids the same as a missing numeric id — both return 404.
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"statusCode": http.StatusNotFound,
				"error":      "NotFoundException",
				"message":    "User with ID " + idStr + " not found",
				// details is an object (gin.H) for NotFound — carries resource type and id.
				"details": gin.H{
					"resource": "user",
					"id":       idStr,
				},
				"timestamp": getISO8601Timestamp(),
				"path":      c.Request.URL.Path,
			})
			return  // stop processing; c.JSON already wrote the response
		}

		// Linear scan of in-memory slice; foundUser is nil when no match.
		var foundUser *User
		for _, u := range users {
			if u.ID == id {
				u := u               // capture loop variable before taking its address
				foundUser = &u
				break
			}
		}

		if foundUser == nil {
			c.JSON(http.StatusNotFound, gin.H{
				"statusCode": http.StatusNotFound,
				"error":      "NotFoundException",
				"message":    "User with ID " + idStr + " not found",
				"details": gin.H{
					"resource": "user",
					"id":       idStr,
				},
				"timestamp": getISO8601Timestamp(),
				"path":      c.Request.URL.Path,
			})
			return
		}

		// User found — return in the success envelope.
		c.JSON(http.StatusOK, gin.H{
			"statusCode": http.StatusOK,
			"message":    "Lấy thông tin thành công (EN: Find user success)",
			"data":       foundUser,
			"timestamp":  getISO8601Timestamp(),
		})
	})

	// POST /users — validate the JSON payload and create a new user.
	// Validation is done manually (no framework annotation) to keep the error
	// envelope format consistent with the other language implementations.
	r.POST("/users", func(c *gin.Context) {
		// ShouldBindJSON decodes the body into the map; on failure (malformed JSON)
		// we initialize an empty map so the validation below treats it as "no fields".
		var payload map[string]interface{}
		if err := c.ShouldBindJSON(&payload); err != nil {
			payload = make(map[string]interface{})
		}

		var messages []string

		// Check if `name` exists in the payload and is a string type.
		nameVal, nameExists := payload["name"]
		nameStr, nameIsStr := nameVal.(string)  // type assertion; nameIsStr = false when not a string

		if !nameExists || !nameIsStr {
			// Name absent or wrong type — report both the type error and the length error at once
			// so clients can show all problems in a single response (consistent with other langs).
			messages = append(messages, "name must be a string", "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)")
		} else {
			if len(nameStr) < 3 {
				// Name is a string but too short — only the length error applies.
				messages = append(messages, "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)")
			}
		}

		if len(messages) > 0 {
			// Return the error envelope directly (no panic/throw in Go — write response and return).
			// details is an array ([]string) for validation errors — consistent with TS/Java/C#.
			c.JSON(http.StatusBadRequest, gin.H{
				"statusCode": http.StatusBadRequest,
				"error":      "BadRequestException",
				// Join messages for the human-readable `message` field.
				"message": strings.Join(messages, ", "),
				// Preserve the slice as `details` so clients can iterate individual errors.
				"details":   messages,
				"timestamp": getISO8601Timestamp(),
				"path":      c.Request.URL.Path,
			})
			return
		}

		// Validation passed — nameStr is a valid non-empty string ≥ 3 chars.
		trimmedName := strings.TrimSpace(nameStr)  // remove surrounding whitespace
		user := User{
			ID:   nextId,      // assign current counter value
			Name: trimmedName,
		}
		nextId++                    // increment AFTER assigning so next call gets a unique id
		users = append(users, user) // append to in-memory store

		c.JSON(http.StatusCreated, gin.H{
			"statusCode": http.StatusCreated,
			"message":    "Tạo thành công (EN: Create success)",
			"data":       user,
			"timestamp":  getISO8601Timestamp(),
		})
	})

	// Read the listen port from the PORT environment variable; default to 3000.
	// Bind to all interfaces (":port") for Docker/Cloud compatibility.
	// For local e2e use the PORT env to assign a free port via the port-mapping convention.
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	r.Run(":" + port)  // starts the Gin HTTP server; blocks until the process exits
}
