/**
 * DTO validate payload tao.
 * (EN: DTO validates creation payload.)
 */
import {
    IsEmail, IsInt, IsString, Max, Min, MinLength 
} from "class-validator"

/**
 * DTO cho endpoint POST /users — định nghĩa schema đầu vào khi tạo user mới (EN: DTO for POST /users — defines input schema for creating a new user).
 * Mỗi decorator class-validator tương ứng má»™t ràng buá»™c; ValidationPipe sẽ kiá»ƒm tra trước khi Controller nhận request (EN: each class-validator decorator maps to a constraint checked by ValidationPipe before the controller).
 */
export class CreateUserDto {
    /**
     * Tên ngÆ°á»i dùng — bắt buá»™c chuỗi, tối thiá»ƒu 3 ký tự (EN: user name — required string, min 3 chars).
     */
    @IsString()
    @MinLength(3,
        {
            message: "Tên quá ngắn — tối thiá»ƒu 3 ký tự (EN: Name too short — min 3 chars)",
        })
        name: string

    /**
     * Äá»‹a chỉ email — bắt buá»™c đúng định dạng email (EN: email address — must be valid email format).
     */
    @IsEmail({
    },
    {
        message: "Email không hợp lệ (EN: Invalid email)",
    })
        email: string

    /**
     * Tuổi ngÆ°á»i dùng — bắt buá»™c số nguyên từ 18 đến 100 (EN: user age — must be integer between 18 and 100).
     */
    @IsInt()
    @Min(18)
    @Max(100)
        age: number
}
