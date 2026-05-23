/**
 * DTO validate payload tao.
 * (EN: DTO validates creation payload.)
 */
import {
    ApiProperty 
} from "@nestjs/swagger"
import {
    Type 
} from "class-transformer"
import {
    IsNumber, IsString 
} from "class-validator"

/**
 * DTO tạo mèo — **Swagger** cần `@ApiProperty` vì type TS bị erase khi build (EN: create-cat DTO; Swagger needs runtime metadata from `@ApiProperty`).
 */
export class CreateCatDto {
    @ApiProperty({
        example: "Persian",
        description: "Breed of the cat",
    })
    @IsString()
        breed!: string

    @ApiProperty({
        example: 2,
        description: "Age in years",
    })
    @Type(() => Number)
    @IsNumber()
        age!: number
}
