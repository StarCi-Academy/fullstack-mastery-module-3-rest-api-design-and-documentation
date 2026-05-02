# Swagger / OpenAPI + Scalar (NestJS)

Demo **NestJS** + **`@nestjs/swagger`** + **`@scalar/nestjs-api-reference`** cho bài `3-swagger-api-documentation`: **OpenAPI** sinh từ decorator, **Swagger UI** tại `/swagger`, **Scalar** tại `/scalar`, đồng thời giữ **TransformInterceptor** + **AllExceptionsFilter** như bài unified response (EN: NestJS OpenAPI from decorators with Swagger UI and Scalar plus unified success/error envelopes).

---

## 1. Setup

Không dùng Docker. Cần **Node.js LTS**, `npm`, `git`. File **`.env`** (`PORT`) có sẵn trong thư mục bài (EN: no Docker; `.env` with `PORT` included).

```bash
npm install
```

---

## 2. Run application

```bash
npm run start:dev
```

Mặc định `http://localhost:3000` (hoặc `PORT` trong `.env`) (EN: default port 3000).

---

## 3. System flow

```
Browser → /swagger | /scalar | /swagger-json
                ↓
         OpenAPI document (generated)
                ↓
Client → CatController → CatService (memory)
```

---

## 4. Kiểm thử (theo `vi.md`)

**Docs JSON**

```bash
curl -s http://localhost:3000/swagger-json
```

**Cats API**

```bash
curl -s http://localhost:3000/cats
```

**Error demo**

```bash
curl -s http://localhost:3000/cats/error-demo
```

**POST hợp lệ (ví dụ)**

```bash
curl -s -X POST http://localhost:3000/cats \
  -H "Content-Type: application/json" \
  -d "{\"breed\":\"Persian\",\"age\":2}"
```

Trình duyệt: `http://localhost:3000/swagger` và `http://localhost:3000/scalar` (EN: open Swagger UI and Scalar in the browser).

---

## 5. Dọn tài nguyên

Không có container — chỉ cần dừng process dev (EN: stop the dev process only).
