/**
 * DTO địa chỉ lồng — minh hoạ nested validation với @ValidateNested + @Type.
 * (EN: Nested address DTO — demonstrates nested validation with @ValidateNested + @Type.)
 */
import {
    IsString, Length, Matches
} from "class-validator"

/**
 * DTO cho object con `address` — phải có city + zip hợp lệ
 * (EN: Sub-object DTO for `address` — must include valid city + zip).
 */
export class AddressDto {
    /**
     * Tên thành phố — chuỗi, tối thiểu 2 ký tự (EN: city name — string, min 2 chars).
     */
    @IsString()
    @Length(2, 100, {
        message: "City phải dài 2-100 ký tự (EN: city must be 2-100 chars)",
    })
        city!: string

    /**
     * Mã ZIP — chuỗi 4-10 ký tự số (EN: ZIP code — 4-10 digit string).
     */
    @IsString()
    @Matches(/^\d{4,10}$/, {
        message: "ZIP phải gồm 4-10 chữ số (EN: ZIP must be 4-10 digits)",
    })
        zip!: string
}
