/**
 * Query DTO for GET /users — demonstrates automatic string-to-number coercion.
 *
 * URL query params are always strings ("?page=2"). The combination of
 * `transform: true` on ValidationPipe + `@Type(() => Number)` here converts "2" to 2
 * before @IsInt runs, so the numeric constraint is reliable.
 */
import {
    Type
} from "class-transformer"
import {
    IsInt, IsOptional, Max, Min
} from "class-validator"

/**
 * Pagination query parameters for the user list endpoint.
 * Both fields are optional and default to safe values if omitted.
 */
export class ListUsersQuery {
    /**
     * Page number (1-based index).
     * @Type(() => Number) coerces the query-string "1" to the number 1 before @IsInt runs.
     * Default: 1 — returns the first page when the param is absent.
     */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
        page?: number = 1

    /**
     * Number of items per page.
     * Capped at 100 to prevent clients from loading unbounded result sets.
     * Default: 10 — a reasonable page size for most listing UIs.
     */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
        limit?: number = 10
}
