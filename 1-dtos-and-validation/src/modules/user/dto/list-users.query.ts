/**
 * Query DTO cho GET /users — minh hoạ type coercion (string → number).
 * (EN: Query DTO for GET /users — demonstrates string → number type coercion.)
 */
import {
    Type
} from "class-transformer"
import {
    IsInt, IsOptional, Max, Min
} from "class-validator"

/**
 * Query params phân trang — page/limit là số nguyên dương sau khi `transform: true` ép kiểu
 * (EN: pagination query params — page/limit are positive integers after `transform: true` coercion).
 */
export class ListUsersQuery {
    /**
     * Số trang — mặc định 1 (EN: page number — default 1).
     * `@Type(() => Number)` ép "1" trên URL thành number 1 trước khi `@IsInt` chạy
     * (EN: `@Type(() => Number)` coerces URL "1" to number 1 before `@IsInt` runs).
     */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
        page?: number = 1

    /**
     * Số phần tử/trang — tối đa 100 (EN: items per page — max 100).
     */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
        limit?: number = 10
}
