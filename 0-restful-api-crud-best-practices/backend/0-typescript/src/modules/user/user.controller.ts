/**
 * REST controller for User feature.
 */
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
} from "@nestjs/common"
import type {
    User
} from "./interfaces"
import {
    UserService
} from "./user.service"

/** HTTP adapter; delegates to service only.
 */
@Controller("users")
export class UserController {
    constructor(private readonly usersService: UserService) { }

    /** demo wipe-all for lesson reset.
     * **HTTP 204** no body.
     */
    @Delete("demo/clear-all")
    @HttpCode(HttpStatus.NO_CONTENT)
    async demoClearAll(): Promise<void> {
        await this.usersService.removeAll()
    }

    /** demo insert one faker-backed user.
     *
     * @returns Promise<User> — **HTTP 201** + user JSON.
     */
    @Post("demo/seed-one")
    @HttpCode(HttpStatus.CREATED)
    async demoSeedOne(): Promise<User> {
        return this.usersService.seedOneWithFaker()
    }

    /** return all users from PostgreSQL.
     * user array, possibly empty.
     */
    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll()
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

    /** create a new user from body.
     * optional name/email.
     * newly created record.
     * inserts into PostgreSQL.
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() payload: Partial<User>): Promise<User> {
        return this.usersService.create(payload)
    }

    /** full replace of name/email per PUT semantics.
     * user id to update.
     * replacement values.
     * updated record.
     */
    @Put(":id")
    async update(
        @Param("id") id: string,
        @Body() payload: User,
    ): Promise<User> {
        return this.usersService.update(id, payload)
    }

    /** partial update for provided fields only.
     *
     * @param id - user id.
     * only sent fields change.
     * record after patch.
     */
    @Patch(":id")
    async patch(
        @Param("id") id: string,
        @Body() payload: Partial<User>,
    ): Promise<User> {
        return this.usersService.patch(id, payload)
    }

    /** delete user by id.
     * user id to delete.
     * no body on success (HTTP 204).
     * deletes PostgreSQL row.
     */
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param("id") id: string): Promise<void> {
        await this.usersService.remove(id)
    }
}
