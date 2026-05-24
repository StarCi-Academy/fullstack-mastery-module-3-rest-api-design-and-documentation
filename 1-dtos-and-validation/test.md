# Test Result

**Status:** PASSED

## Expected & Actual Matches

## Flow 1 -- Valid payload (`POST /users`)
Tạo dữ liệu trả về 201:
```json
{
  "id": "d7f14s",
  "name": "Alice",
  "email": "alice@test.com",
  "age": 25,
  "address": null
}
```

## Flow 2 -- Invalid payload (`POST /users`)
Trả về 400:
```json
{
  "message": [
    "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)",
    "name must be a string",
    "Email không hợp lệ (EN: Invalid email)",
    "age must not be greater than 100",
    "age must not be less than 18",
    "age must be an integer number"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

## Flow 3 -- Type coercion (`GET /users?page=1&limit=5`)
Trả về 200:
```json
[
  {
    "id": "d7f14s",
    "name": "Alice",
    "email": "alice@test.com",
    "age": 25,
    "address": null
  }
]
```

## Flow 4 -- Nested DTO (`POST /users` with bad address)
Trả về 400:
```json
{
  "message": [
    "address.City phải dài 2-100 ký tự (EN: city must be 2-100 chars)",
    "address.ZIP phải gồm 4-10 chữ số (EN: ZIP must be 4-10 digits)"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

## Notes

- The L1 module requires PostgreSQL running via `docker compose -f .docker/compose.yaml up -d` before `nest start --watch`.
- `ConfigModule` ships defaults in `.env`; only override for non-default ports/credentials.
