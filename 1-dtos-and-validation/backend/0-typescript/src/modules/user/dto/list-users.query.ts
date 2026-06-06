/** Query DTO for GET /users — demonstrates string → number type coercion.
 */
import {
    Type
} from "class-transformer"
import {
    IsInt, IsOptional, Max, Min
} from "class-validator"

/** pagination query params — page/limit are positive integers after `transform: true` coercion.
 */
export class ListUsersQuery {
    /** page number — default 1.
     * `@Type(( => Number)` coerces URL "1" to number 1 before `@IsInt` runs).
     */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
        page?: number = 1

    /** items per page — max 100.
     */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
        limit?: number = 10
}
