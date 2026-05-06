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
 * DTO táº¡o mÃ¨o â€” **Swagger** cáº§n `@ApiProperty` vÃ¬ type TS bá»‹ erase khi build (EN: create-cat DTO; Swagger needs runtime metadata from `@ApiProperty`).
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
