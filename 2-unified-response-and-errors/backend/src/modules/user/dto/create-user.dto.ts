/**
 * DTO validate payload tao user demo.
 * (EN: DTO validates payload to create demo user.)
 */
import {
    IsString, MinLength
} from "class-validator"

/**
 * DTO cho POST /users — `name` bắt buộc chuỗi tối thiểu 3 ký tự
 * (EN: DTO for POST /users — `name` is required string ≥ 3 chars).
 */
export class CreateUserDto {
    /**
     * Tên user — chuỗi bắt buộc, tối thiểu 3 ký tự (EN: user name — required string, min 3 chars).
     */
    @IsString()
    @MinLength(3, {
        message: "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)",
    })
        name!: string
}
