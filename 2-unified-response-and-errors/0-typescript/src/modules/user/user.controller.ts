/**
 * REST controller for User feature.
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

/** HTTP adapter demonstrating success envelope, validation error envelope, and domain NotFoundException.
 */
@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    /** success envelope with custom `@ResponseMessage`.
     * demo user list.
     */
    @Get()
Get all success)"
    findAll(): DemoUser[] {
        return this.usersService.findAll()
    }

    /** lookup user; throws structured NotFoundException when missing.
     * user id key.
     * found user.
     * throws NotFoundException when id absent.
     */
    @Get(":id")
Find user success)"
    findOne(@Param("id") id: string): DemoUser {
        const user = this.usersService.findOne(id)
        if (!user) {
            // NotFoundException carries structured details for clients.
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

    /** POST /users — body validated by `CreateUserDto`; failing → ValidationPipe 400; passing → 201.
     *
     * @param dto - JSON body per CreateUserDto.
     * newly created user payload.
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
Create success)"
    create(@Body() dto: CreateUserDto): { id: number; name: string } {
        return this.usersService.create(dto.name.trim())
    }
}
