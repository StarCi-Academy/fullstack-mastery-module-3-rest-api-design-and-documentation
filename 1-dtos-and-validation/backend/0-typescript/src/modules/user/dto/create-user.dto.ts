/**
 * DTO validates creation payload.
 */
import {
    Type
} from "class-transformer"
import {
    IsEmail, IsInt, IsOptional, IsString, Max, Min, MinLength, ValidateNested
} from "class-validator"
import {
    AddressDto
} from "./address.dto"

/** DTO for POST /users — defines input schema for creating a new user.
 * each class-validator decorator maps to a constraint checked by ValidationPipe before the controller.
 */
export class CreateUserDto {
    /** user name — required string, min 3 chars.
     */
    @IsString()
    @MinLength(3,
        {
            message: "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)",
        })
        name!: string

    /** email address — must be valid email format.
     */
    @IsEmail({
    },
    {
        message: "Email không hợp lệ (EN: Invalid email)",
    })
        email!: string

    /** user age — must be integer between 18 and 100.
     */
    @IsInt()
    @Min(18)
    @Max(100)
        age!: number

    /** nested address — optional; if present must satisfy AddressDto.
     * pair of `@ValidateNested(` + `@Type(() => AddressDto)` is required for recursive validation).
     */
    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
        address?: AddressDto
}
