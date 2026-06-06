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

type User struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Email   string   `json:"email"`
	Age     int      `json:"age"`
	Address *Address `json:"address"`
}

type Address struct {
	City string `json:"city"`
	Zip  string `json:"zip"`
}

var users = []User{}
var letters = []rune("abcdefghijklmnopqrstuvwxyz0123456789")

func nextUniqueShortId() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for {
		b := make([]rune, 6)
		for i := range b {
			b[i] = letters[r.Intn(len(letters))]
		}
		candidate := string(b)
		exists := false
		for _, u := range users {
			if u.ID == candidate {
				exists = true
				break
			}
		}
		if !exists {
			return candidate
		}
	}
}

func main() {
	r := gin.Default()

	r.POST("/users", func(c *gin.Context) {
		var payload map[string]interface{}
		if err := c.ShouldBindJSON(&payload); err != nil {
			payload = make(map[string]interface{})
		}

		var messages []string

		// Validate name
		nameVal, nameExists := payload["name"]
		nameStr, nameIsStr := nameVal.(string)
		if !nameExists || !nameIsStr {
			messages = append(messages, "name must be a string", "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)")
		} else if len(nameStr) < 3 {
			messages = append(messages, "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)")
		}

		// Validate email
		emailVal, emailExists := payload["email"]
		emailStr, emailIsStr := emailVal.(string)
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

		// Validate age
		ageVal, ageExists := payload["age"]
		if !ageExists {
			messages = append(messages, "age must be an integer number", "age must not be less than 18", "age must not be greater than 100")
		} else {
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
				messages = append(messages, "age must be an integer number", "age must not be less than 18", "age must not be greater than 100")
			} else {
				isInteger := val == float64(int(val))
				if !isInteger {
					messages = append(messages, "age must be an integer number")
				}
				if val < 18 {
					messages = append(messages, "age must not be less than 18")
				}
				if val > 100 {
					messages = append(messages, "age must not be greater than 100")
				}
			}
		}

		// Validate address (optional)
		addressVal, addressExists := payload["address"]
		var addressObj *Address
		if addressExists && addressVal != nil {
			if addrMap, ok := addressVal.(map[string]interface{}); ok {
				cityVal, cityExists := addrMap["city"]
				cityStr, cityIsStr := cityVal.(string)
				if !cityExists || !cityIsStr || len(cityStr) < 2 || len(cityStr) > 100 {
					messages = append(messages, "address.City phải dài 2-100 ký tự (EN: city must be 2-100 chars)")
				}

				zipVal, zipExists := addrMap["zip"]
				zipStr, zipIsStr := zipVal.(string)
				matched, _ := regexp.MatchString(`^\d{4,10}$`, zipStr)
				if !zipExists || !zipIsStr || !matched {
					messages = append(messages, "address.ZIP phải gồm 4-10 chữ số (EN: ZIP must be 4-10 digits)")
				}

				if len(messages) == 0 {
					addressObj = &Address{
						City: cityStr,
						Zip:  zipStr,
					}
				}
			} else {
				messages = append(messages, "address must be an object")
			}
		}

		if len(messages) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"statusCode": http.StatusBadRequest,
				"message":    messages,
				"error":      "Bad Request",
			})
			return
		}

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
			Address: addressObj,
		}
		users = append(users, user)

		c.JSON(http.StatusCreated, user)
	})

	r.GET("/users", func(c *gin.Context) {
		pageStr := c.DefaultQuery("page", "1")
		limitStr := c.DefaultQuery("limit", "10")

		page, err := strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			page = 1
		}
		limit, err := strconv.Atoi(limitStr)
		if err != nil || limit < 1 {
			limit = 10
		}

		sort.Slice(users, func(i, j int) bool {
			return users[i].ID < users[j].ID
		})

		startIndex := (page - 1) * limit
		if startIndex >= len(users) {
			c.JSON(http.StatusOK, []User{})
			return
		}

		endIndex := startIndex + limit
		if endIndex > len(users) {
			endIndex = len(users)
		}

		c.JSON(http.StatusOK, users[startIndex:endIndex])
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	r.Run(":" + port)
}
