# Test Result

**Status:** PASSED

## Expected & Actual Matches

**Luồng 1 -- Seed user khởi tạo (`POST /users/demo/seed-one`)**
Tạo dữ liệu mẫu trả về 201:
```json
{
  "id": "t682m",
  "name": "Chelsea Koelpin",
  "email": "Chelsea_Wolf@hotmail.com"
}
```
Pass criteria: response status là 201 và body chứa `id`, `name`, `email` của user vừa được seed.

**Luồng 2 -- Read list (`GET /users`)**
Lấy danh sách trả về 200:
```json
[
  {
    "id": "t682m",
    "name": "Chelsea Koelpin",
    "email": "Chelsea_Wolf@hotmail.com"
  }
]
```
Pass criteria: status 200, body là array không rỗng, chứa user vừa seed ở Luồng 1 (proves persistence reused across requests).

**Luồng 3 -- Create new user (`POST /users`)**
Trả về 201:
```json
{
  "id": "pgvt7",
  "name": "Bob",
  "email": "bob@test.com"
}
```

**Luồng 4 -- Full update (`PUT /users/:id`)**
Trả về 200:
```json
{
  "id": "pgvt7",
  "name": "Bob Updated",
  "email": "bob2@test.com"
}
```

**Luồng 5 -- Partial update (`PATCH /users/:id`)**
Trả về 200:
```json
{
  "id": "pgvt7",
  "name": "Bob Patched",
  "email": "bob2@test.com"
}
```

**Luồng 6 -- Delete (`DELETE /users/:id`)**
Trả về 204 (No Content)

**Các thay đổi đã thực hiện:**
- Chỉnh sửa đường dẫn trong doc từ `/users/seed` thành `/users/demo/seed-one` để khớp với controller.

(Luồng CRUD Restful API hoạt động chính xác với đúng các HTTP Verbs và Status Codes.)