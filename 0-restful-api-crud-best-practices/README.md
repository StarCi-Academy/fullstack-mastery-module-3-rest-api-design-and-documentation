# RESTful API CRUD best practices (NestJS)

Demo **Users** với **PostgreSQL** + **TypeORM** cho bài `0-restful-api-crud-best-practices` — minh họa contract REST (method, URL, status code) trên **NestJS**, dữ liệu bền vững qua DB (EN: REST contract demo backed by PostgreSQL via TypeORM).

---

## 1. Setup (Docker + env + dependency)

Theo `repo.md`, compose đặt dưới `.docker/postgresql.yaml` và publish port **5432** để app local kết nối.

Luồng **env thuần**: `ConfigModule` đọc file **`.env`** ở thư mục gốc bài — tự đảm bảo file tồn tại và có đủ biến (tham khảo **`.env.example`** trong repo). **`.env.example`** giữ làm mẫu chuẩn; **`.env`** chỉ local và **không** commit (đã `.gitignore`). Không ghi bước `cp .env.example .env` trong block lệnh chuẩn. Chỉnh giá trị trong `.env` nếu khác mặc định (mặc định khớp Postgres trong compose).

```bash
docker compose -f .docker/postgresql.yaml up --build -d
npm install
```

---

## 2. Run application

```bash
npm run dev
```

Hoặc:

```bash
npm run start:dev
```

Ứng dụng listen cổng `PORT` (mặc định **3000** nếu không set env). **PostgreSQL phải đang chạy** trước khi boot Nest (EN: PostgreSQL must be up before starting Nest).

---

## 3. System flow (luồng hệ thống)

Luồng xử lý chính cho mỗi HTTP request tới resource users:

```
Client → UserController → UserService → TypeORM Repository → PostgreSQL
```

- **UserController:** map route + status HTTP (ví dụ `201` cho `POST`, `204` cho `DELETE`).  
- **UserService:** resolve bản ghi, mutate entity; khi boot không tạo sẵn bản ghi — bảng trống thì `GET /users` trả `[]`. Endpoint demo: **`DELETE /users/demo/clear-all`** (xóa hết bảng), **`POST /users/demo/seed-one`** (seed một user demo — `name`/`email` cố định trong bài).  
- **TypeORM + `UserEntity`:** map bảng `users`; `TYPEORM_SYNC=true` (demo) tự tạo schema — production nên migration.

Ánh xạ pattern vận hành (gần với tinh thần `prepare → execute → confirm` trong `repo.md`):

1. **Chuẩn bị / resolve:** `findOne` / `find` xác định bản ghi trước khi mutate.  
2. **Thực thi:** `save` / `delete` trên PostgreSQL.  
3. **Xác nhận:** trả DTO `User` hoặc `void` + HTTP code / exception chuẩn Nest.

---

## 4. Smoke test (curl)

```bash
curl -s http://localhost:3000/users
```

Kỳ vọng khi bảng `users` trống: body **`[]`** (HTTP **200**).

Seed user demo (bài lab — xóa hết bảng rồi `POST /users/demo/seed-one`; `name`/`email` cố định trong tài liệu):

```bash
curl -s -i -X DELETE http://localhost:3000/users/demo/clear-all
curl -s -X POST http://localhost:3000/users/demo/seed-one
curl -s http://localhost:3000/users
```

Tạo user:

```bash
curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Nguyen Van A\",\"email\":\"a@example.com\"}"
```

Đọc một user theo `id` (thay `<userId>` bằng `id` trong JSON trả về của lệnh POST trên):

```bash
curl -s http://localhost:3000/users/<userId>
```

Kỳ vọng: HTTP **200**, body là user vừa tạo (`name` / `email` khớp POST).

Xóa rồi đọc lại (cùng `<userId>`):

```bash
curl -s -X DELETE http://localhost:3000/users/<userId>
curl -s -i http://localhost:3000/users/<userId>
```

Kỳ vọng: `GET /users` → `200` và **`[]`** khi chưa có dữ liệu; `POST /users` → `201`; `GET /users/<userId>` khi id tồn tại → `200`; `DELETE` thành công → `204`; `GET` sau xóa → `404`.

---

## 5. Dọn tài nguyên (Docker)

```bash
docker compose -f .docker/postgresql.yaml down -v
```

---

## 6. Cấu trúc source (theo `repo.md`)

| File / thư mục | Vai trò |
| --- | --- |
| `.docker/postgresql.yaml` | PostgreSQL local cho demo |
| `.env.example` | Mẫu biến môi trường DB |
| `src/modules/user/index.ts` | Barrel export |
| `src/modules/user/user.entity.ts` | Entity TypeORM → bảng `users` |
| `src/modules/user/user.controller.ts` | HTTP — không chứa nghiệp vụ |
| `src/modules/user/user.service.ts` | CRUD + log + NotFound + seed |
| `src/modules/user/interfaces/user.interface.ts` | Kiểu `User` trả API |

---

## 7. Build production bundle

```bash
npm run build
npm run start:prod
```
