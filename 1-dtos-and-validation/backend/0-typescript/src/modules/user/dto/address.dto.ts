/**
 * Nested address DTO — demonstrates recursive validation with @ValidateNested + @Type.
 *
 * This class is instantiated by class-transformer (@Type) so class-validator can recurse
 * into it. Without instantiation, the validators on city/zip would never run.
 */
import {
    IsString, Length, Matches
} from "class-validator"

/**
 * Sub-object DTO for the optional `address` field in CreateUserDto.
 * Both city and zip must pass their constraints for the parent request to be accepted.
 */
export class AddressDto {
    /**
     * City or locality name.
     * Constraint: string between 2 and 100 characters (accommodates short codes like "DC"
     * and long names like "Thành phố Hồ Chí Minh").
     */
    @IsString()
    @Length(2, 100, {
        message: "City phải dài 2-100 ký tự (EN: city must be 2-100 chars)",
    })
        city!: string

    /**
     * Postal ZIP code.
     * Constraint: 4–10 digit string matching /^\d{4,10}$/.
     * Digits-only rule covers both short postal codes (e.g. "1000") and longer ones (e.g. "12345-6789").
     */
    @IsString()
    @Matches(/^\d{4,10}$/, {
        // Custom message preserves the nested path in the error array
        // so the client knows exactly which field failed ("address.ZIP").
        message: "ZIP phải gồm 4-10 chữ số (EN: ZIP must be 4-10 digits)",
    })
        zip!: string
}
