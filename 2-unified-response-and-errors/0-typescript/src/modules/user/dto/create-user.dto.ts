/**
 * DTO validates payload to create demo user.
 */
import {
    IsString, MinLength
} from "class-validator"

/** DTO for POST /users — `name` is required string ≥ 3 chars.
 */
export class CreateUserDto {
    /** user name — required string, min 3 chars.
     */
    @IsString()
    @MinLength(3, {
        message: "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)",
    })
        name!: string
}
