# Test Result

**Status:** PASSED

## Expected & Actual Matches

**Luồng 1 -- Seed và đọc danh sách (`POST /users/demo/seed-one`)**
Tạo dữ liệu mẫu trả về 201:
```json
{
  "id": "rd2lpa",
  "name": "Chelsea Koelpin",
  "email": "Chelsea_Wolf@hotmail.com"
}
```

Lấy danh sách `GET /users` trả về 200:
```json
[
  {
    "id": "rd2lpa",
    "name": "Chelsea Koelpin",
    "email": "Chelsea_Wolf@hotmail.com"
  }
]
```

**Luồng 2 -- Create new user (`POST /users`)**
Trả về 201:
```json
{
  "id": "v87lrn",
  "name": "Bob",
  "email": "bob@test.com"
}
```

**Luồng 3 -- Full update (`PUT /users/:id`)**
Trả về 200:
```json
{
  "id": "v87lrn",
  "name": "Bob Updated",
  "email": "bob2@test.com"
}
```

**Luồng 4 -- Partial update (`PATCH /users/:id`)**
Trả về 200:
```json
{
  "id": "v87lrn",
  "name": "Bob Patched",
  "email": "bob2@test.com"
}
```

**Luồng 5 -- Delete (`DELETE /users/:id`)**
Trả về 204 (No Content)

**Các thay đổi đã thực hiện:**
- Chỉnh sửa đường dẫn trong doc từ `/users/seed` thành `/users/demo/seed-one` để khớp với controller.

(Luồng CRUD Restful API hoạt động chính xác với đúng các HTTP Verbs và Status Codes.)