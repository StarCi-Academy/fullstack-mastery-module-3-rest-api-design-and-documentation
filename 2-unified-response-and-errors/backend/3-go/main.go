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

type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

var users = []User{
	{ID: 1, Name: "John Doe"},
}
var nextId = 2

func getISO8601Timestamp() string {
	return time.Now().UTC().Format("2006-01-02T15:04:05.000Z")
}

func main() {
	r := gin.Default()

	// Handle Route Not Found 404
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"statusCode": http.StatusNotFound,
			"error":      "NotFoundException",
			"message":    "Cannot " + c.Request.Method + " " + c.Request.URL.Path,
			"timestamp":  getISO8601Timestamp(),
			"path":       c.Request.URL.Path,
		})
	})

	// GET /users
	r.GET("/users", func(c *gin.Context) {
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

	// GET /users/:id
	r.GET("/users/:id", func(c *gin.Context) {
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
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

		var foundUser *User
		for _, u := range users {
			if u.ID == id {
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

		c.JSON(http.StatusOK, gin.H{
			"statusCode": http.StatusOK,
			"message":    "Lấy thông tin thành công (EN: Find user success)",
			"data":       foundUser,
			"timestamp":  getISO8601Timestamp(),
		})
	})

	// POST /users
	r.POST("/users", func(c *gin.Context) {
		var payload map[string]interface{}
		if err := c.ShouldBindJSON(&payload); err != nil {
			payload = make(map[string]interface{})
		}

		var messages []string
		nameVal, nameExists := payload["name"]
		nameStr, nameIsStr := nameVal.(string)

		if !nameExists || !nameIsStr {
			messages = append(messages, "name must be a string", "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)")
		} else {
			if len(nameStr) < 3 {
				messages = append(messages, "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)")
			}
		}

		if len(messages) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"statusCode": http.StatusBadRequest,
				"error":      "BadRequestException",
				"message":    strings.Join(messages, ", "),
				"details":    messages,
				"timestamp":  getISO8601Timestamp(),
				"path":       c.Request.URL.Path,
			})
			return
		}

		trimmedName := strings.TrimSpace(nameStr)
		user := User{
			ID:   nextId,
			Name: trimmedName,
		}
		nextId++
		users = append(users, user)

		c.JSON(http.StatusCreated, gin.H{
			"statusCode": http.StatusCreated,
			"message":    "Tạo thành công (EN: Create success)",
			"data":       user,
			"timestamp":  getISO8601Timestamp(),
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	r.Run(":" + port)
}
