# Test Result

**Status:** PENDING (e2e re-run after content + code refactor; previous local run PASSED for flows 1-2)

## Flow 1 -- Success envelope (`GET /users`)

```bash
curl -s http://localhost:3000/users
```

Expected HTTP 200:

```json
{
  "statusCode": 200,
  "message": "Lấy danh sách thành công (EN: Get all success)",
  "data": [
    { "id": 1, "name": "John Doe" }
  ],
  "timestamp": "<ISO datetime>"
}
```

## Flow 2 -- Error envelope (route not found)

```bash
curl -s http://localhost:3000/unknown-path
```

Expected HTTP 404:

```json
{
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "Cannot GET /unknown-path",
  "timestamp": "<ISO datetime>",
  "path": "/unknown-path"
}
```

## Flow 3 -- Validation error envelope (`POST /users` with bad body)

```bash
curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"a"}'
```

Expected HTTP 400:

```json
{
  "statusCode": 400,
  "error": "BadRequestException",
  "message": "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)",
  "details": [
    "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)"
  ],
  "timestamp": "<ISO datetime>",
  "path": "/users"
}
```

`AllExceptionsFilter.resolveDetails` lifts the `message` array from `BadRequestException` into the top-level `details` field.

## Flow 4 -- Domain exception envelope (`GET /users/9999`)

```bash
curl -s http://localhost:3000/users/9999
```

Expected HTTP 404:

```json
{
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "User with ID 9999 not found",
  "details": {
    "resource": "user",
    "id": "9999"
  },
  "timestamp": "<ISO datetime>",
  "path": "/users/9999"
}
```

The controller throws `new NotFoundException({ message, details: { resource, id } })`; the filter preserves the structured `details`.

## Notes

- L2 has no Docker — only `npm install` + `nest start --watch`.
- `ValidationPipe`, `TransformInterceptor`, and `AllExceptionsFilter` are all registered globally in `bootstrap.ts`.
