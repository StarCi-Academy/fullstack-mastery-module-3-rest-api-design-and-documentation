package main

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

type Cat struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
}

var cats = []Cat{
	{Name: "Milo", Age: 3},
}

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

func main() {
	r := gin.Default()

	// Serve Swagger spec and UI
	r.GET("/swagger/doc.json", func(c *gin.Context) {
		c.Header("Content-Type", "application/json")
		c.String(http.StatusOK, swaggerJSON)
	})

	r.GET("/swagger-json", func(c *gin.Context) {
		c.Header("Content-Type", "application/json")
		c.String(http.StatusOK, swaggerJSON)
	})

	r.GET("/swagger", func(c *gin.Context) {
		c.Header("Content-Type", "text/html")
		c.String(http.StatusOK, swaggerUIHTML)
	})

	r.GET("/swagger/index.html", func(c *gin.Context) {
		c.Header("Content-Type", "text/html")
		c.String(http.StatusOK, swaggerUIHTML)
	})

	// GET /cats
	r.GET("/cats", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"statusCode": http.StatusOK,
			"message":    "Lấy danh sách mèo thành công (EN: Get all cats success)",
			"data":       cats,
			"timestamp":  getISO8601Timestamp(),
		})
	})

	// POST /cats
	r.POST("/cats", func(c *gin.Context) {
		var payload map[string]interface{}
		if err := c.ShouldBindJSON(&payload); err != nil {
			payload = make(map[string]interface{})
		}

		var messages []string
		breedVal, breedExists := payload["breed"]
		breedStr, breedIsStr := breedVal.(string)
		if !breedExists || !breedIsStr {
			messages = append(messages, "breed must be a string")
		}

		ageVal, ageExists := payload["age"]
		var ageInt int
		var ageIsNum bool
		if ageExists {
			switch v := ageVal.(type) {
			case float64:
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

		if len(messages) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"statusCode": http.StatusBadRequest,
				"error":      "BadRequestException",
				"message":    messages[0],
				"timestamp":  getISO8601Timestamp(),
				"path":       c.Request.URL.Path,
			})
			return
		}

		newCat := Cat{
			Name: breedStr,
			Age:  ageInt,
		}
		cats = append(cats, newCat)

		c.JSON(http.StatusCreated, gin.H{
			"statusCode": http.StatusCreated,
			"message":    "Success",
			"data":       newCat,
			"timestamp":  getISO8601Timestamp(),
		})
	})

	// GET /cats/error-demo
	r.GET("/cats/error-demo", func(c *gin.Context) {
		c.JSON(http.StatusBadRequest, gin.H{
			"statusCode": http.StatusBadRequest,
			"error":      "BadRequestException",
			"message":    "Đây là lỗi giả lập để test Unified Error Response",
			"timestamp":  getISO8601Timestamp(),
			"path":       c.Request.URL.Path,
		})
	})

	// GET /dogs
	r.GET("/dogs", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"statusCode": http.StatusOK,
			"message":    "Success",
			"data":       []interface{}{},
			"timestamp":  getISO8601Timestamp(),
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	r.Run(":" + port)
}
