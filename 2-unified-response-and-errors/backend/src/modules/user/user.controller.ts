/**
 * Controller REST cho feature User.
 * (EN: REST controller for User feature.)
 */
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
} from "@nestjs/common"
import {
    ResponseMessage
} from "../../common/decorators"
import {
    CreateUserDto
} from "./dto"
import {
    UsersService
} from "./user.service"
import type {
    DemoUser
} from "./user.service"

/**
 * HTTP adapter `/users` — minh hoạ success envelope, validation error envelope, và domain NotFoundException
 * (EN: HTTP adapter demonstrating success envelope, validation error envelope, and domain NotFoundException).
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
     * `GET /users/:id` — tra cứu user, ném NotFoundException kèm details `{ resource, id }` nếu không có
     * (EN: lookup user; throws structured NotFoundException when missing).
     *
     * @param id - Khoá id user (EN: user id key).
     * @returns User tìm thấy (EN: found user).
     * @sideEffects Ném NotFoundException khi id không tồn tại (EN: throws NotFoundException when id absent).
     */
    @Get(":id")
    @ResponseMessage("Tìm user thành công (EN: Find user success)")
    findOne(@Param("id") id: string): DemoUser {
        const user = this.usersService.findOne(id)
        if (!user) {
            // NotFoundException mang theo details có cấu trúc cho client (EN: NotFoundException carries structured details for clients).
            throw new NotFoundException({
                message: `User with ID ${id} not found`,
                details: {
                    resource: "user",
                    id,
                },
            })
        }
        return user
    }

    /**
     * `POST /users` — body validate bởi `CreateUserDto`; sai → ValidationPipe trả 400; đúng → 201
     * (EN: POST /users — body validated by `CreateUserDto`; failing → ValidationPipe 400; passing → 201).
     *
     * @param dto - Payload JSON theo CreateUserDto (EN: JSON body per CreateUserDto).
     * @returns User vừa tạo (EN: newly created user payload).
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ResponseMessage("Tạo mới thành công (EN: Create success)")
    create(@Body() dto: CreateUserDto): { id: number; name: string } {
        return this.usersService.create(dto.name.trim())
    }
}
