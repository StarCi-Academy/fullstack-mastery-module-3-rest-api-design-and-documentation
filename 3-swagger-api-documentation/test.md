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

## Flow 4 -- Tagged routes grouping in Swagger UI

Visual check on `http://localhost:3000/swagger`:

- Sidebar shows two tag sections: **Cats Module** and **Dogs Module**.
- Expanding Cats Module lists `POST /cats`, `GET /cats`, `GET /cats/error-demo`.
- Expanding Dogs Module lists `GET /dogs`.

Pass criteria: tag sections are distinct, each route appears under the tag declared by its controller's `@ApiTags()`.

## Flow 5 -- Bearer auth lock icon + Authorize dialog

Visual check on `http://localhost:3000/swagger`:

- **POST `/cats`** displays a lock icon next to its summary; **GET `/cats`** and **GET `/dogs`** do NOT.
- Clicking the top-right **Authorize** button opens "Available authorizations" with the `bearer` scheme listed.
- Paste any token (e.g. `test-token`), click Authorize, then run **POST /cats** via "Try it out" -- the curl preview now contains `-H "Authorization: Bearer test-token"`.

Pass criteria: lock icon visible only on the route decorated with `@ApiBearerAuth()`; Authorize dialog opens and injects the header on subsequent Execute calls.

## Notes

- L3 has no Docker — only `npm install` + `nest start --watch`.
- The OpenAPI spec is auto-generated from controller decorators and DTO `@ApiProperty` metadata; no manual YAML/JSON.
