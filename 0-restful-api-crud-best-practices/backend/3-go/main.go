package main

import (
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID    string `gorm:"primaryKey;size:36" json:"id"`
	Name  string `gorm:"size:255;not null" json:"name"`
	Email string `gorm:"size:255;not null" json:"email"`
}

var letters = []rune("abcdefghijklmnopqrstuvwxyz0123456789")

func nextUniqueShortId(db *gorm.DB) string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := 0; i < 32; i++ {
		b := make([]rune, 5)
		for j := range b {
			b[j] = letters[r.Intn(len(letters))]
		}
		candidate := string(b)
		var count int64
		db.Model(&User{}).Where("id = ?", candidate).Count(&count)
		if count == 0 {
			return candidate
		}
	}
	panic("Failed to allocate unique user id after retries")
}

func main() {
	host := os.Getenv("POSTGRES_HOST")
	if host == "" {
		host = "localhost"
	}
	port_env := os.Getenv("POSTGRES_PORT")
	if port_env == "" {
		port_env = "5432"
	}
	user := os.Getenv("POSTGRES_USER")
	if user == "" {
		user = "starci"
	}
	password := os.Getenv("POSTGRES_PASSWORD")
	if password == "" {
		password = "starci"
	}
	dbname := os.Getenv("POSTGRES_DB")
	if dbname == "" {
		dbname = "starci"
	}
	dsn := "host=" + host + " user=" + user + " password=" + password + " dbname=" + dbname + " port=" + port_env + " sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database: " + err.Error())
	}

	// Auto migrate
	err = db.AutoMigrate(&User{})
	if err != nil {
		panic("Failed to run migrations: " + err.Error())
	}

	// Initialize Gin
	r := gin.Default()

	// Routes
	r.DELETE("/users/demo/clear-all", func(c *gin.Context) {
		db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&User{})
		c.Status(http.StatusNoContent)
	})

	r.POST("/users/demo/seed-one", func(c *gin.Context) {
		id := nextUniqueShortId(db)
		user := User{
			ID:    id,
			Name:  "Chelsea Koelpin",
			Email: "Chelsea_Wolf@hotmail.com",
		}
		db.Create(&user)
		c.JSON(http.StatusCreated, user)
	})

	r.GET("/users", func(c *gin.Context) {
		var users []User
		db.Order("id asc").Find(&users)
		c.JSON(http.StatusOK, users)
	})

	r.GET("/users/:id", func(c *gin.Context) {
		id := c.Param("id")
		var user User
		if err := db.First(&user, "id = ?", id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"statusCode": http.StatusNotFound,
				"message":    "User with ID " + id + " not found",
				"error":      "Not Found",
			})
			return
		}
		c.JSON(http.StatusOK, user)
	})

	r.POST("/users", func(c *gin.Context) {
		var payload map[string]interface{}
		if err := c.ShouldBindJSON(&payload); err != nil {
			payload = make(map[string]interface{})
		}

		name := "Anonymous"
		if n, ok := payload["name"].(string); ok && n != "" {
			name = n
		}

		email := "no-email@example.com"
		if e, ok := payload["email"].(string); ok && e != "" {
			email = e
		}

		id := nextUniqueShortId(db)
		user := User{
			ID:    id,
			Name:  name,
			Email: email,
		}
		db.Create(&user)
		c.JSON(http.StatusCreated, user)
	})

	r.PUT("/users/:id", func(c *gin.Context) {
		id := c.Param("id")
		var user User
		if err := db.First(&user, "id = ?", id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"statusCode": http.StatusNotFound,
				"message":    "User with ID " + id + " not found",
				"error":      "Not Found",
			})
			return
		}

		var payload map[string]interface{}
		if err := c.ShouldBindJSON(&payload); err == nil {
			if n, ok := payload["name"].(string); ok {
				user.Name = n
			} else {
				user.Name = ""
			}
			if e, ok := payload["email"].(string); ok {
				user.Email = e
			} else {
				user.Email = ""
			}
		}

		db.Save(&user)
		c.JSON(http.StatusOK, user)
	})

	r.PATCH("/users/:id", func(c *gin.Context) {
		id := c.Param("id")
		var user User
		if err := db.First(&user, "id = ?", id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"statusCode": http.StatusNotFound,
				"message":    "User with ID " + id + " not found",
				"error":      "Not Found",
			})
			return
		}

		var payload map[string]interface{}
		if err := c.ShouldBindJSON(&payload); err == nil {
			if n, ok := payload["name"].(string); ok {
				user.Name = n
			}
			if e, ok := payload["email"].(string); ok {
				user.Email = e
			}
		}

		db.Save(&user)
		c.JSON(http.StatusOK, user)
	})

	r.DELETE("/users/:id", func(c *gin.Context) {
		id := c.Param("id")
		var user User
		if err := db.First(&user, "id = ?", id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"statusCode": http.StatusNotFound,
				"message":    "Cannot delete: User not found",
				"error":      "Not Found",
			})
			return
		}

		db.Delete(&user)
		c.Status(http.StatusNoContent)
	})

	// Run server on specified port
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	r.Run(":" + port)
}
