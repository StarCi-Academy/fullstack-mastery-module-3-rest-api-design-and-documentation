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
    @ResponseMessage("Get all success")
    findAll(): DemoUser[] {
        return this.usersService.findAll()
    }

    /** GET /users/boom — deliberately throws an unhandled Error to demonstrate
     * that `AllExceptionsFilter` catches **any** exception and returns a 500
     * generic error envelope with NO stack trace exposed to the client.
     *
     * Teaching intent: this is Flow 4 — even a plain `throw new Error(...)` that
     * bypasses all domain exception handling is intercepted at the boundary and
     * normalized to `{ statusCode: 500, error: "Internal Error", message: "Internal Server Error", ... }`.
     * The real error detail stays on the server (logged), never reaching the client.
     *
     * IMPORTANT: this route must be registered BEFORE @Get(":id") so NestJS matches
     * the literal path segment "boom" before the wildcard parameter captures it.
     *
     * @throws Error - intentional unhandled error; caught by AllExceptionsFilter.
     */
    @Get("boom")
    boom(): never {
        // Deliberately throw a plain Error with a sensitive-looking message to prove
        // the filter strips it before the response — the client only ever sees the
        // generic "Internal Server Error" message, never "boom" or any stack trace.
        throw new Error("boom")
    }

    /** lookup user; throws structured NotFoundException when missing.
     * user id key.
     * found user.
     * throws NotFoundException when id absent.
     */
    @Get(":id")
    @ResponseMessage("Find user success")
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
    @ResponseMessage("Create success")
    create(@Body() dto: CreateUserDto): { id: number; name: string } {
        return this.usersService.create(dto.name.trim())
    }
}
