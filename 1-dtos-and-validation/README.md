# DTOs and Validation — NestJS + PostgreSQL Demo

Minh hoạ cách xây dựng lớp phòng thủ đầu vào cho API bằng **DTO** + **ValidationPipe** + **PostgreSQL** (TypeORM).

## Stack

- **NestJS** (HTTP framework)
- **TypeORM** + **PostgreSQL** (persistence)
- **class-validator** + **class-transformer** (validation decorators + auto transform)

## Chạy local (EN: Run locally)

```bash
# 1. Khởi PostgreSQL
docker compose -f .docker/postgresql.yaml up --build -d

# 2. Cài dependency
npm install

# 3. Chạy dev server
npm run start:dev
```

## Kiểm thử nhanh (EN: Quick smoke test)

```bash
# Payload hợp lệ → 201
curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice Nguyen\",\"email\":\"alice@example.com\",\"age\":28}"

# Payload sai → 400
curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Al\",\"email\":\"not-an-email\",\"age\":15}"
```

## Dọn tài nguyên (EN: Clean up)

```bash
docker compose -f .docker/postgresql.yaml down -v
```
