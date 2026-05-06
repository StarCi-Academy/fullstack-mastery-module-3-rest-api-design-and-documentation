/**
 * Controller REST cho feature User.
 * (EN: REST controller for User feature.)
 */
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
} from "@nestjs/common"
import {
    ResponseMessage 
} from "../../common/decorators"
import {
    UsersService 
} from "./user.service"
import type {
    DemoUser 
} from "./user.service"

/**
 * HTTP adapter `/users` â€” minh hoáº¡ success envelope + `BadRequestException` bá»c bá»Ÿi filter (EN: HTTP adapter demonstrating success envelope and filtered validation errors).
 */
@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    /**
     * `GET /users` â€” envelope success + message tuá»³ chá»‰nh (EN: success envelope with custom `@ResponseMessage`).
     *
     * @returns Danh sÃ¡ch user demo (EN: demo user list).
     */
    @Get()
    @ResponseMessage("Láº¥y danh sÃ¡ch thÃ nh cÃ´ng (EN: Get all success)")
    findAll(): DemoUser[] {
        return this.usersService.findAll()
    }

    /**
     * `POST /users` â€” thiáº¿u `name` â†’ 400; Ä‘á»§ `name` â†’ 201 + envelope (EN: missing `name` yields 400; valid body yields 201 + envelope).
     *
     * @param body - Payload JSON cÃ³ thá»ƒ cÃ³ `name` (EN: JSON body optionally containing `name`).
     * @returns User vá»«a táº¡o (EN: newly created user payload).
     * @sideEffects CÃ³ thá»ƒ nÃ©m `BadRequestException` (EN: may throw `BadRequestException`).
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ResponseMessage("Táº¡o má»›i thÃ nh cÃ´ng (EN: Create success)")
    create(@Body() body: { name?: string }): { id: number; name: string } {
        if (!body?.name?.trim()) {
            throw new BadRequestException(
                "TÃªn khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng (EN: Name is required)",
            )
        }
        return this.usersService.create(body.name.trim())
    }
}
