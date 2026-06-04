/**
 * REST controller for User feature.
 */
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
} from "@nestjs/common"
import type {
    User
} from "./interfaces"
import {
    UserService
} from "./user.service"
import {
    CreateUserDto,
    ListUsersQuery
} from "./dto"

/** HTTP adapter for users; demonstrates DTO + ValidationPipe protection.
 */
@Controller("users")
export class UserController {
    constructor(private readonly usersService: UserService) {}

    /** return all users from PostgreSQL.
     * user array, possibly empty.
     */
    @Get()
    async findAll(@Query() query: ListUsersQuery): Promise<User[]> {
        // ValidationPipe + @Type(( => Number) coerce `?page=1&limit=10` to numbers before reaching this handler).
        return this.usersService.findAll(query.page, query.limit)
    }

    /** fetch one user by id.
     * user identifier.
     * found record.
     * may throw NotFoundException if missing.
     */
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<User> {
        return this.usersService.findOne(id)
    }

    /** create user; body must match CreateUserDto or ValidationPipe returns 400.
     * validated DTO.
     * newly created record.
     * inserts into PostgreSQL.
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto)
    }
}
