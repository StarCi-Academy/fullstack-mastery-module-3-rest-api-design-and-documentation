/**
 * DTO validate payload tao.
 * (EN: DTO validates creation payload.)
 */
import {
    IsEmail, IsInt, IsString, Max, Min, MinLength 
} from "class-validator"

/**
 * DTO cho endpoint POST /users â€” Ä‘á»‹nh nghÄ©a schema Ä‘áº§u vÃ o khi táº¡o user má»›i (EN: DTO for POST /users â€” defines input schema for creating a new user).
 * Má»—i decorator class-validator tÆ°Æ¡ng á»©ng má»™t rÃ ng buá»™c; ValidationPipe sáº½ kiá»ƒm tra trÆ°á»›c khi Controller nháº­n request (EN: each class-validator decorator maps to a constraint checked by ValidationPipe before the controller).
 */
export class CreateUserDto {
    /**
     * TÃªn ngÆ°á»i dÃ¹ng â€” báº¯t buá»™c chuá»—i, tá»‘i thiá»ƒu 3 kÃ½ tá»± (EN: user name â€” required string, min 3 chars).
     */
    @IsString()
    @MinLength(3, {
        message: "TÃªn quÃ¡ ngáº¯n â€” tá»‘i thiá»ƒu 3 kÃ½ tá»± (EN: Name too short â€” min 3 chars)",
    })
        name: string

    /**
     * Äá»‹a chá»‰ email â€” báº¯t buá»™c Ä‘Ãºng Ä‘á»‹nh dáº¡ng email (EN: email address â€” must be valid email format).
     */
    @IsEmail({}, {
        message: "Email khÃ´ng há»£p lá»‡ (EN: Invalid email)",
    })
        email: string

    /**
     * Tuá»•i ngÆ°á»i dÃ¹ng â€” báº¯t buá»™c sá»‘ nguyÃªn tá»« 18 Ä‘áº¿n 100 (EN: user age â€” must be integer between 18 and 100).
     */
    @IsInt()
    @Min(18)
    @Max(100)
        age: number
}
