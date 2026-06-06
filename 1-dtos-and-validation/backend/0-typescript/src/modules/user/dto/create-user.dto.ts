/**
 * Input contract DTO for POST /users.
 *
 * Each class-validator decorator is one constraint enforced by the global ValidationPipe
 * before the request reaches the controller. The DTO acts as an allowlist: any field
 * not declared here is stripped (whitelist) or rejected (forbidNonWhitelisted).
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

/**
 * DTO for POST /users — defines the input schema for creating a new user.
 *
 * Only fields declared here can reach business logic. Extra fields sent by a client
 * are rejected at the boundary, preventing mass-assignment attacks.
 */
export class CreateUserDto {
    /**
     * Display name of the user.
     * Constraint: non-empty string of at least 3 characters.
     */
    @IsString()
    @MinLength(3,
        {
            // Custom message tells the client exactly what is wrong and where the minimum is.
            message: "Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)",
        })
        name!: string

    /**
     * Email address of the user.
     * Constraint: must pass RFC-5321 email syntax check.
     */
    @IsEmail({
    },
    {
        // Custom message provides clearer wording than the default "email must be an email".
        message: "Email không hợp lệ (EN: Invalid email)",
    })
        email!: string

    /**
     * Age of the user in years.
     * Constraints: integer in range [18, 100].
     * The `transform: true` option on ValidationPipe coerces a JSON number literal to a
     * TypeScript `number` before these decorators run — so the int check is reliable.
     */
    @IsInt()
    @Min(18)
    @Max(100)
        age!: number

    /**
     * Optional postal address.
     * When present, the nested object must satisfy all constraints in AddressDto.
     *
     * The pair @ValidateNested() + @Type(() => AddressDto) is BOTH required:
     * - @Type tells class-transformer to instantiate AddressDto (plain object → class instance).
     * - @ValidateNested tells class-validator to recurse into the instance.
     * Missing either decorator silently skips nested validation.
     */
    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
        address?: AddressDto
}
