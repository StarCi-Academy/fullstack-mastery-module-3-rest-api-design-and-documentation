// Package main implements the Swagger API Documentation lesson backend in Go.
// It uses the Gin HTTP framework and serves a hardcoded OpenAPI 3.0 spec together with
// a Swagger UI page so students can compare the annotation-driven approach from TypeScript,
// Java, and C# with a hand-authored spec (the idiomatic Go approach for simple demos).
package main

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// Cat represents a single cat record in the in-memory store.
// JSON tags control how fields are serialised (lowercase snake_case for the API envelope).
type Cat struct {
	Name string `json:"name"` // display name (derived from the breed field at creation)
	Age  int    `json:"age"`  // age in years
}

// cats is the shared in-memory store, seeded with one sample record.
// Global var is acceptable here because the lesson scope is a single-process demo server.
var cats = []Cat{
	{Name: "Milo", Age: 3},
}

// getISO8601Timestamp returns the current UTC time in ISO 8601 / RFC 3339 format.
// Go's reference time is "Mon Jan 2 15:04:05 MST 2006" — the layout below matches
// the TypeScript/Java/C# timestamp format used in the unified response envelope.
func getISO8601Timestamp() string {
	return time.Now().UTC().Format("2006-01-02T15:04:05.000Z")
}

const swaggerJSON = `{
  "openapi": "3.0.0",
  "info": {
    "title": "StarCi Academy Backend",
    "description": "API documentation for the REST API Design & Documentation lesson",
    "version": "1.0",
    "contact": {}
  },
  "paths": {
    "/cats": {
      "get": {
        "tags": ["Cats Module"],
        "summary": "Retrieve all cats",
        "responses": {
          "200": {
            "description": "List of cats returned"
          }
        }
      },
      "post": {
        "tags": ["Cats Module"],
        "summary": "Create a new cat",
        "security": [
          {
            "bearer": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateCatDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Cat created"
          },
          "400": {
            "description": "Invalid payload"
          }
        }
      }
    },
    "/cats/error-demo": {
      "get": {
        "tags": ["Cats Module"],
        "summary": "Demo error response (Bad Request)",
        "responses": {
          "400": {
            "description": "Simulated bad request for unified error contract"
          }
        }
      }
    },
    "/dogs": {
      "get": {
        "tags": ["Dogs Module"],
        "summary": "Retrieve all dogs",
        "responses": {
          "200": {
            "description": "List of dogs returned"
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "bearer": {
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "type": "http"
      }
    },
    "schemas": {
      "CreateCatDto": {
        "type": "object",
        "properties": {
          "breed": {
            "type": "string",
            "description": "Breed of the cat",
            "example": "Persian"
          },
          "age": {
            "type": "number",
            "description": "Age in years",
            "example": 2
          }
        },
        "required": ["breed", "age"]
      }
    }
  }
}`

const swaggerUIHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" >
    <style>
      html { box-sizing: border-box; overflow: -y-scroll; }
      *, *:before, *:after { box-sizing: inherit; }
      body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"> </script>
    <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"> </script>
    <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "/swagger/doc.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
      window.ui = ui;
    };
    </script>
</body>
</html>`

// main is the entry point. It registers all routes and starts the Gin HTTP server.
func main() {
	// gin.Default() attaches the Logger and Recovery middleware (panic → 500, log every request).
	r := gin.Default()

	// Serve OpenAPI spec and Swagger UI at the lesson-standard URL paths.
	// The spec is a hardcoded constant because Go's annotation-based spec generators
	// (swaggo/swag) require a separate CLI step; the constant makes the demo self-contained.
	r.GET("/swagger/doc.json", func(c *gin.Context) {
		c.Header("Content-Type", "application/json")
		c.String(http.StatusOK, swaggerJSON)
	})

	// /swagger-json is the canonical alias shared across all four language backends.
	r.GET("/swagger-json", func(c *gin.Context) {
		c.Header("Content-Type", "application/json")
		c.String(http.StatusOK, swaggerJSON)
	})

	// Serve the embedded Swagger UI HTML at both /swagger and /swagger/index.html.
	r.GET("/swagger", func(c *gin.Context) {
		c.Header("Content-Type", "text/html")
		c.String(http.StatusOK, swaggerUIHTML)
	})

	r.GET("/swagger/index.html", func(c *gin.Context) {
		c.Header("Content-Type", "text/html")
		c.String(http.StatusOK, swaggerUIHTML)
	})

	// GET /cats — returns all cats wrapped in the unified success envelope.
	// gin.H is a shorthand for map[string]interface{}; keys are sorted alphabetically in JSON output.
	r.GET("/cats", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"statusCode": http.StatusOK,
			"message":    "Lấy danh sách mèo thành công (EN: Get all cats success)",
			"data":       cats,
			"timestamp":  getISO8601Timestamp(),
		})
	})

	// POST /cats — validates the payload manually (no struct binding) to mirror the
	// cross-language approach; creates a new cat and returns it in the success envelope.
	r.POST("/cats", func(c *gin.Context) {
		// ShouldBindJSON deserialises the body; on parse failure we treat the payload as empty
		// so the field-level validation below still runs and returns correct error messages.
		var payload map[string]interface{}
		if err := c.ShouldBindJSON(&payload); err != nil {
			payload = make(map[string]interface{})
		}

		var messages []string

		// JSON numbers deserialise as float64 in Go — type-assert to string for breed.
		breedVal, breedExists := payload["breed"]
		breedStr, breedIsStr := breedVal.(string)
		if !breedExists || !breedIsStr {
			messages = append(messages, "breed must be a string")
		}

		// JSON numbers can arrive as float64 or int depending on the client; handle both.
		ageVal, ageExists := payload["age"]
		var ageInt int
		var ageIsNum bool
		if ageExists {
			switch v := ageVal.(type) {
			case float64:
				// Most JSON parsers produce float64 for all numbers — truncate to int.
				ageInt = int(v)
				ageIsNum = true
			case int:
				ageInt = v
				ageIsNum = true
			}
		}
		if !ageExists || !ageIsNum {
			messages = append(messages, "age must be a number conforming to the specified constraints")
		}

		// Return the first validation error (consistent with TypeScript/Java behaviour).
		if len(messages) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"statusCode": http.StatusBadRequest,
				"error":      "BadRequestException", // mirrors NestJS exception class name convention
				"message":    messages[0],
				"timestamp":  getISO8601Timestamp(),
				"path":       c.Request.URL.Path,
			})
			return
		}

		// Safe: guarded above.
		newCat := Cat{
			Name: breedStr, // breed is stored as name (same mapping as TypeScript/Java/C#)
			Age:  ageInt,
		}
		cats = append(cats, newCat) // append to shared in-memory slice

		c.JSON(http.StatusCreated, gin.H{
			"statusCode": http.StatusCreated,
			"message":    "Success",
			"data":       newCat,
			"timestamp":  getISO8601Timestamp(),
		})
	})

	// GET /cats/error-demo — always returns 400 so students can observe the error envelope.
	r.GET("/cats/error-demo", func(c *gin.Context) {
		c.JSON(http.StatusBadRequest, gin.H{
			"statusCode": http.StatusBadRequest,
			"error":      "BadRequestException",
			"message":    "Simulated error for Unified Error Response demo",
			"timestamp":  getISO8601Timestamp(),
			"path":       c.Request.URL.Path,
		})
	})

	// GET /dogs — demonstrates a second Swagger tag grouping; returns an empty list.
	r.GET("/dogs", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"statusCode": http.StatusOK,
			"message":    "Success",
			"data":       []interface{}{}, // empty list — dogs store not seeded
			"timestamp":  getISO8601Timestamp(),
		})
	})

	// Read port from env so e2e tests can run multiple lang servers in parallel without collisions.
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000" // default port for local development
	}
	r.Run(":" + port) // start Gin server; blocks until the process is terminated
}
