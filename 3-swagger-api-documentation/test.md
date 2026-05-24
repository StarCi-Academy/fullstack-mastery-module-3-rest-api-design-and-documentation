# Test Result

**Status:** PASSED

## Expected & Actual Matches

## Flow 1 -- Open Swagger UI
Tru cập `GET /swagger` trả về HTTP 200.

## Flow 2 -- Call API from Swagger
Tạo cat trả về 201:
```json
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "name": "Persian",
    "age": 2
  },
  "timestamp": "2026-05-24T10:18:37.814Z"
}
```
Gọi endpoint lỗi demo trả về 400:
```json
{
  "statusCode": 400,
  "error": "BadRequestException",
  "message": "ÄÃ¢y là lỗi giả lập Ä‘á»ƒ test Unified Error Response",
  "timestamp": "2026-05-24T10:18:37.817Z",
  "path": "/cats/error-demo"
}
```

## Flow 3 -- Swagger JSON spec endpoint
Tru cập `GET /swagger-json` trả về HTTP 200. Nội dung spec JSON (rút gọn):
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "StarCi Academy Backend",
    "description": "API documentation for the REST API Design & Documentation lesson",
    "version": "1.0",
    "contact": {}
  },
  "pathsCount": 3,
  "schemasCount": 1
}
```

## Flow 4 -- Tagged routes grouping in Swagger UI
Visual Check: sidebar hiển thị 2 nhóm riêng biệt: **Cats Module** (chứa `/cats` routes) và **Dogs Module** (chứa `/dogs` route) tương ứng với `@ApiTags` annotation.

## Flow 5 -- Bearer auth lock icon + Authorize dialog
Visual Check: Endpoint `POST /cats` hiển thị lock icon do được cấu hình `@ApiBearerAuth()`. Nút Authorize ở góc trên hiển thị dialog Security Scheme `bearer` chính xác.

## Notes

- L3 has no Docker — only `npm install` + `nest start --watch`.
- The OpenAPI spec is auto-generated from controller decorators and DTO `@ApiProperty` metadata; no manual YAML/JSON.
