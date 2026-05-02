# Unified response & exception filter (NestJS)

Demo **NestJS thuần** (không database) cho bài `2-unified-response-and-errors`: **TransformInterceptor** bọc success `{ statusCode, message, data, timestamp }`, **AllExceptionsFilter** bọc lỗi `{ statusCode, error, message, timestamp, path }`, decorator **`@ResponseMessage()`** tuỳ message từng endpoint (EN: Nest-only demo for unified success/error envelopes and per-route success messages).

---

## 1. Setup

Bài không dùng Docker — chỉ cần **Node.js LTS**, `npm`, `git`. File **`.env`** (chỉ `PORT`) đã có trong thư mục bài để clone xong chạy được (EN: no Docker; `.env` with `PORT` is included for immediate local run).

```bash
npm install
```

---

## 2. Run application

```bash
npm run start:dev
```

Ứng dụng listen `http://localhost:3000` (hoặc `PORT` trong `.env`) (EN: listens on port 3000 by default).

---

## 3. System flow (luồng hệ thống)

```
Client → UsersController → UsersService (memory)
                ↓ success
         TransformInterceptor → unified JSON
                ↓ error
         AllExceptionsFilter → unified JSON
```

---

## 4. Kiểm thử (theo giáo trình `vi.md`)

**Luồng 1 — success envelope**

```bash
curl -s http://localhost:3000/users
```

**Luồng 2 — error envelope (400)**

```bash
curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{}"
```

**Luồng 3 — POST hợp lệ (201 + message tuỳ chỉnh)**

```bash
curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice\"}"
```

---

## 5. Dọn tài nguyên

Không có container — chỉ cần dừng process `npm` (EN: stop the dev process; no containers).
