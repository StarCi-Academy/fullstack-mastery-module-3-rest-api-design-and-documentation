// Package main is the entry point for the RESTful CRUD demo application.
// It exposes a /users resource with full CRUD endpoints using Gin (HTTP router)
// and GORM (ORM) backed by a PostgreSQL database provisioned via Docker.
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

// User represents a user row in the PostgreSQL "users" table.
// GORM derives the table name from the struct name (lowercase plural by default).
// JSON tags use lowercase field names to match the REST contract expected by clients.
type User struct {
	// ID is the application-assigned primary key (5-char alphanumeric short ID).
	// "primaryKey" tells GORM not to use auto-increment; size:36 allows future UUID migration.
	ID string `gorm:"primaryKey;size:36" json:"id"`

	// Name is the display name; required, max 255 chars.
	Name string `gorm:"size:255;not null" json:"name"`

	// Email is the email address; required, max 255 chars.
	Email string `gorm:"size:255;not null" json:"email"`
}

// letters is the alphabet used when generating random short IDs.
// Lowercase alphanumeric keeps IDs URL-safe and human-readable.
var letters = []rune("abcdefghijklmnopqrstuvwxyz0123456789")

// nextUniqueShortId generates a 5-character alphanumeric ID that does not
// already exist in the database. It retries up to 32 times before panicking
// to avoid an infinite loop when the ID space is unexpectedly exhausted.
//
// Parameters:
//   - db: active GORM database handle used to check for duplicate primary keys.
//
// Returns the first candidate ID not found in the users table.
func nextUniqueShortId(db *gorm.DB) string {
	// Seed the random source from the current nanosecond clock for uniqueness across calls.
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := 0; i < 32; i++ {
		b := make([]rune, 5)
		// Pick 5 random characters from the allowed alphabet.
		for j := range b {
			b[j] = letters[r.Intn(len(letters))]
		}
		candidate := string(b)

		// Count rows with this ID; only return the candidate when none exist.
		var count int64
		db.Model(&User{}).Where("id = ?", candidate).Count(&count)
		if count == 0 {
			return candidate
		}
	}
	panic("Failed to allocate unique user id after retries")
}

// main is the application entry point.
// It reads DB and server configuration from environment variables,
// opens a GORM/Postgres connection, auto-migrates the schema,
// registers all Gin routes, and starts the HTTP server on loopback.
func main() {
	// --- Read PostgreSQL connection parameters from environment variables ---
	// Defaults match the Docker Compose config shipped with the lesson.
	host := os.Getenv("POSTGRES_HOST")
	if host == "" {
		host = "localhost"
	}
	portEnv := os.Getenv("POSTGRES_PORT")
	if portEnv == "" {
		portEnv = "5432"
	}
	user := os.Getenv("POSTGRES_USER")
	if user == "" {
		// Default user matches the lesson's compose.yaml credential.
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

	// Build the Postgres DSN string from individual components.
	// sslmode=disable is safe for local Docker; enable for cloud Postgres.
	dsn := "host=" + host + " user=" + user + " password=" + password + " dbname=" + dbname + " port=" + portEnv + " sslmode=disable"

	// Open the GORM connection; panic early if the database is unreachable.
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database: " + err.Error())
	}

	// AutoMigrate creates or alters the "users" table to match the User struct.
	// Safe to call on every startup — only missing columns/tables are added.
	err = db.AutoMigrate(&User{})
	if err != nil {
		panic("Failed to run migrations: " + err.Error())
	}

	// Initialize Gin with default middleware (Logger + Recovery).
	r := gin.Default()

	// --- Demo utility routes ---

	// DELETE /users/demo/clear-all — wipe all rows for a clean lesson state.
	// AllowGlobalUpdate is required because GORM rejects un-conditioned deletes by default.
	r.DELETE("/users/demo/clear-all", func(c *gin.Context) {
		db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&User{})
		// 204 No Content signals success without a response body.
		c.Status(http.StatusNoContent)
	})

	// POST /users/demo/seed-one — insert one fixed demo user so read flows have data.
	// Returns 201 Created + the seeded user JSON.
	r.POST("/users/demo/seed-one", func(c *gin.Context) {
		id := nextUniqueShortId(db)
		// Fixed name/email keeps demo output reproducible across lesson runs.
		user := User{
			ID:    id,
			Name:  "Chelsea Koelpin",
			Email: "Chelsea_Wolf@hotmail.com",
		}
		db.Create(&user)
		c.JSON(http.StatusCreated, user)
	})

	// --- RESTful CRUD routes ---

	// GET /users — return all users ordered by id ascending.
	// Empty array (not 404) is the correct response when no users exist.
	r.GET("/users", func(c *gin.Context) {
		var users []User
		// Stable ordering ensures deterministic output for curl test comparisons.
		db.Order("id asc").Find(&users)
		c.JSON(http.StatusOK, users)
	})

	// GET /users/:id — fetch one user by primary key.
	// Returns 200 + user JSON if found; 404 with problem JSON if not found.
	r.GET("/users/:id", func(c *gin.Context) {
		id := c.Param("id")
		var user User
		// db.First returns gorm.ErrRecordNotFound when no row matches.
		if err := db.First(&user, "id = ?", id).Error; err != nil {
			// Return a structured error body matching the lesson contract.
			c.JSON(http.StatusNotFound, gin.H{
				"statusCode": http.StatusNotFound,
				"message":    "User with ID " + id + " not found",
				"error":      "Not Found",
			})
			return
		}
		c.JSON(http.StatusOK, user)
	})

	// POST /users — create a new user from the JSON request body.
	// id is assigned server-side; the client sends only name and email.
	// Returns 201 Created + the new resource.
	r.POST("/users", func(c *gin.Context) {
		var payload map[string]interface{}
		// Tolerate a missing or malformed body by falling back to an empty map.
		if err := c.ShouldBindJSON(&payload); err != nil {
			payload = make(map[string]interface{})
		}

		// Apply safe defaults when optional fields are absent from the body.
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

	// PUT /users/:id — full replacement; ALL fields are overwritten from the body.
	// Absent fields become empty strings (strict PUT semantics).
	// Returns 200 + updated user; 404 if the id does not exist.
	r.PUT("/users/:id", func(c *gin.Context) {
		id := c.Param("id")
		var user User
		// 404 guard — PUT on a non-existent resource is an error in this API design.
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
			// Overwrite both fields unconditionally — absent key becomes empty string.
			if n, ok := payload["name"].(string); ok {
				user.Name = n
			} else {
				user.Name = "" // PUT requires replacing even if the field was omitted.
			}
			if e, ok := payload["email"].(string); ok {
				user.Email = e
			} else {
				user.Email = ""
			}
		}

		// db.Save updates all columns (including zero-value ones) — correct for PUT.
		db.Save(&user)
		c.JSON(http.StatusOK, user)
	})

	// PATCH /users/:id — partial update; only fields present in the body are changed.
	// Fields absent from the payload retain their current values (unlike PUT).
	// Returns 200 + updated user; 404 if the id does not exist.
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
			// Only overwrite a field when the key exists in the payload (PATCH semantics).
			if n, ok := payload["name"].(string); ok {
				user.Name = n
			}
			if e, ok := payload["email"].(string); ok {
				user.Email = e
			}
		}

		// db.Save writes all fields; existing values are preserved for omitted keys
		// because we only mutated the fields that were present in the payload.
		db.Save(&user)
		c.JSON(http.StatusOK, user)
	})

	// DELETE /users/:id — remove user by primary key.
	// Returns 204 No Content on success; 404 if the id does not exist.
	r.DELETE("/users/:id", func(c *gin.Context) {
		id := c.Param("id")
		var user User
		// Fetch first so we can return 404 instead of silently no-oping on missing IDs.
		if err := db.First(&user, "id = ?", id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"statusCode": http.StatusNotFound,
				"message":    "Cannot delete: User not found",
				"error":      "Not Found",
			})
			return
		}

		db.Delete(&user)
		// 204 No Content — successful delete has no response body.
		c.Status(http.StatusNoContent)
	})

	// --- Start HTTP server ---

	// Read server port from environment; default to 3000 to match the lesson contract.
	// Bind to loopback (127.0.0.1) so Windows Firewall does not pop up a UAC dialog
	// when running as a new binary in non-interactive (agent / CI) environments.
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	// r.Run("127.0.0.1:<port>") binds only to loopback — safe for local e2e tests.
	r.Run("127.0.0.1:" + port)
}
