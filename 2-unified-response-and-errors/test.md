# Test Result

**Status:** PASSED

## Expected & Actual Matches

## Flow 1 -- Success envelope (`GET /users`)
Trả về 200:
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách thành công (EN: Get all success)",
  "data": [
    {
      "id": 1,
      "name": "John Doe"
    }
  ],
  "timestamp": "2026-05-24T10:18:21.331Z"
}
```

## Flow 2 -- Error envelope (route not found)
Trả về 404:
```json
{
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "Cannot GET /unknown-path",
  "timestamp": "2026-05-24T10:18:21.337Z",
  "path": "/unknown-path"
}
```

## Flow 3 -- Validation error envelope (`POST /users` with bad body)
Trả về 400:
```json
{
  "statusCode": 400,
  "error": "BadRequestException",
  "message": "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)",
  "details": [
    "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)"
  ],
  "timestamp": "2026-05-24T10:18:21.353Z",
  "path": "/users"
}
```

## Flow 4 -- Domain exception envelope (`GET /users/9999`)
Trả về 404:
```json
{
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "User with ID 9999 not found",
  "details": {
    "resource": "user",
    "id": "9999"
  },
  "timestamp": "2026-05-24T10:18:21.355Z",
  "path": "/users/9999"
}
```

## Notes

- L2 has no Docker — only `npm install` + `nest start --watch`.
- `ValidationPipe`, `TransformInterceptor`, and `AllExceptionsFilter` are all registered globally in `bootstrap.ts`.
