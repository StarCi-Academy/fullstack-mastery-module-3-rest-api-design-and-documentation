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
 * HTTP adapter `/users` — minh hoạ success envelope + `BadRequestException` bá»c bởi filter (EN: HTTP adapter demonstrating success envelope and filtered validation errors).
 */
@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    /**
     * `GET /users` — envelope success + message tuỳ chỉnh (EN: success envelope with custom `@ResponseMessage`).
     *
     * @returns Danh sách user demo (EN: demo user list).
     */
    @Get()
    @ResponseMessage("Lấy danh sách thành công (EN: Get all success)")
    findAll(): DemoUser[] {
        return this.usersService.findAll()
    }

    /**
     * `POST /users` — thiếu `name` → 400; đủ `name` → 201 + envelope (EN: missing `name` yields 400; valid body yields 201 + envelope).
     *
     * @param body - Payload JSON có thá»ƒ có `name` (EN: JSON body optionally containing `name`).
     * @returns User vừa tạo (EN: newly created user payload).
     * @sideEffects Có thá»ƒ ném `BadRequestException` (EN: may throw `BadRequestException`).
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ResponseMessage("Tạo mới thành công (EN: Create success)")
    create(@Body() body: { name?: string }): { id: number; name: string } {
        if (!body?.name?.trim()) {
            throw new BadRequestException(
                "Tên không được Ä‘á»ƒ trống (EN: Name is required)",
            )
        }
        return this.usersService.create(body.name.trim())
    }
}
