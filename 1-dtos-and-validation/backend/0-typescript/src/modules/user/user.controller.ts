/**
 * REST controller for the User resource.
 *
 * The controller itself contains zero validation logic — that is entirely handled by the
 * global ValidationPipe registered in bootstrap.ts. By the time a method body runs, the
 * DTO parameter is already a typed class instance with all constraints satisfied.
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

/**
 * HTTP adapter for the users endpoint.
 * Exposes GET /users (list, paginated), GET /users/:id (single), POST /users (create).
 */
@Controller("users")
export class UserController {
    constructor(private readonly usersService: UserService) {}

    /**
     * Return a paginated list of users.
     *
     * @param query - Validated pagination params (page/limit already coerced to numbers by ValidationPipe + @Type).
     * @returns Promise<User[]> — array of user records for the requested page, possibly empty.
     */
    @Get()
    async findAll(@Query() query: ListUsersQuery): Promise<User[]> {
        // Pass coerced page/limit to service; the service applies OFFSET/LIMIT to the store.
        return this.usersService.findAll(query.page, query.limit)
    }

    /**
     * Fetch a single user by id.
     *
     * @param id - The user identifier extracted from the URL path segment.
     * @returns Promise<User> — the matched user record.
     * @throws NotFoundException if no user with the given id exists.
     */
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<User> {
        // Delegate lookup + 404 logic to the service layer.
        return this.usersService.findOne(id)
    }

    /**
     * Create a new user from a validated request body.
     *
     * ValidationPipe intercepts the request before this method runs:
     * - invalid fields → HTTP 400 with an error array
     * - extra fields → stripped (whitelist) or rejected (forbidNonWhitelisted)
     *
     * @param createUserDto - The validated, type-safe input DTO.
     * @returns Promise<User> — the newly created user record with its generated id.
     * @sideEffects Persists a new user record in the in-memory store (or DB in production).
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)  // Override NestJS default 200 → 201 Created for POST.
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto)
    }
}
