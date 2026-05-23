# Test Result

**Status:** PENDING (e2e re-run after content + code refactor; previous local run PASSED for flows 1-2)

## Flow 1 -- Open Swagger UI

Open browser at `http://localhost:3000/swagger` (Swagger UI) or `http://localhost:3000/scalar` (Scalar). Both render the same OpenAPI document; sidebar should list **Cats Module** and **Dogs Module** tag groups.

## Flow 2 -- Call API from Swagger

```bash
curl -s -X POST http://localhost:3000/cats \
  -H "Content-Type: application/json" \
  -d '{"breed":"Persian","age":2}'
```

Expected HTTP 201 wrapped in envelope:

```json
{
  "statusCode": 201,
  "message": "Success",
  "data": { "name": "Persian", "age": 2 },
  "timestamp": "<ISO datetime>"
}
```

`GET /cats/error-demo` returns HTTP 400 unified error envelope.

## Flow 3 -- Swagger JSON spec endpoint

```bash
curl -s http://localhost:3000/swagger-json
```

Expected HTTP 200, content-type `application/json`. The document must contain:

- `openapi: "3.0.0"` (or 3.0.x).
- `info.title === "StarCi Academy Backend"`.
- `paths["/cats"].post` with the bearer security reference.
- `paths["/dogs"].get` (the second tag group's route).
- `components.schemas.CreateCatDto` (generated from `@ApiProperty`).
- `components.securitySchemes.bearer` (from `.addBearerAuth()`).

## Flow 4 -- Tagged routes + bearer auth in Swagger UI

Visual checks on `http://localhost:3000/swagger`:

- Two tag groups: **Cats Module** and **Dogs Module**.
- A lock icon appears on **POST `/cats`** (because of `@ApiBearerAuth()`); none on `GET /cats` or `GET /dogs`.
- Clicking **Authorize** opens the bearer token dialog. After entering any token, locked routes send `Authorization: Bearer <token>` on Execute.

## Notes

- L3 has no Docker — only `npm install` + `nest start --watch`.
- The OpenAPI spec is auto-generated from controller decorators and DTO `@ApiProperty` metadata; no manual YAML/JSON.
