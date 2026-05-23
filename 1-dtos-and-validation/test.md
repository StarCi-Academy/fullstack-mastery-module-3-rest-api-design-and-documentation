# Test Result

**Status:** PENDING (e2e re-run after content + code refactor; previous local run PASSED for flows 1-2)

## Flow 1 -- Valid payload (`POST /users`)

```bash
curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","age":25}'
```

Expected HTTP 201 + body:

```json
{
  "id": "<short-id>",
  "name": "Alice",
  "email": "alice@test.com",
  "age": 25,
  "address": null
}
```

## Flow 2 -- Invalid payload (`POST /users`)

```bash
curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":123}'
```

Expected HTTP 400 + `message` array containing:

- `"name must be a string"`
- `"Email không hợp lệ (EN: Invalid email)"`
- `"age must be an integer number"` / `"age must not be less than 18"` / `"age must not be greater than 100"`

## Flow 3 -- Type coercion (`GET /users?page=1&limit=5`)

```bash
curl -s "http://localhost:3000/users?page=1&limit=5"
```

Expected HTTP 200 + an array of users (possibly empty). `@Type(() => Number)` + `transform: true` ensure the string query params become real numbers before TypeORM `skip`/`take`.

## Flow 4 -- Nested DTO (`POST /users` with bad address)

```bash
curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@test.com","age":25,"address":{"city":"H","zip":"abc"}}'
```

Expected HTTP 400 + `message` array containing entries for `address.city must be longer than or equal to 2` and `address.zip must match /^\\d{4,10}$/`. The pair `@ValidateNested()` + `@Type(() => AddressDto)` makes `class-validator` recurse into the sub-object.

## Notes

- The L1 module requires PostgreSQL running via `docker compose -f .docker/compose.yaml up -d` before `nest start --watch`.
- `ConfigModule` ships defaults in `.env`; only override for non-default ports/credentials.
