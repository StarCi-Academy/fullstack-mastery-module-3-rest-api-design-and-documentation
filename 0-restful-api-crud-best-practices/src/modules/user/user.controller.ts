/**
 * Controller REST cho feature User.
 * (EN: REST controller for User feature.)
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
} from "./interfaces/user.interface"
import {
    UserService 
} from "./user.service"

/**
 * HTTP adapter cho resource users â€” khÃ´ng chá»©a nghiá»‡p vá»¥, chá»‰ á»§y quyá»n cho service (EN: HTTP adapter; delegates to service only).
 */
@Controller("users")
export class UserController {
    constructor(private readonly usersService: UserService) {}

    /**
     * Demo: xÃ³a háº¿t báº£n ghi `users` (dá»n seed / reset bÃ i lab) (EN: demo wipe-all for lesson reset).
     *
     * @returns Promise<void> â€” **HTTP 204** khÃ´ng body (EN: **HTTP 204** no body).
     */
    @Delete("demo/clear-all")
    @HttpCode(HttpStatus.NO_CONTENT)
    async demoClearAll(): Promise<void> {
        await this.usersService.removeAll()
    }

    /**
     * Demo: táº¡o má»™t user báº±ng **@faker-js/faker** (`faker.seed(1337)`) (EN: demo insert one faker-backed user).
     *
     * @returns Promise<User> â€” **HTTP 201** + JSON user (EN: **HTTP 201** + user JSON).
     */
    @Post("demo/seed-one")
    @HttpCode(HttpStatus.CREATED)
    async demoSeedOne(): Promise<User> {
        return this.usersService.seedOneWithFaker()
    }

    /**
     * Tráº£ danh sÃ¡ch user hiá»‡n cÃ³ trong PostgreSQL (EN: return all users from PostgreSQL).
     *
     * @returns Promise<User[]> â€” Máº£ng user (cÃ³ thá»ƒ rá»—ng) (EN: user array, possibly empty).
     */
    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll()
    }

    /**
     * Láº¥y má»™t user theo id (EN: fetch one user by id).
     *
     * @param id - KhÃ³a Ä‘á»‹nh danh user (EN: user identifier).
     * @returns Promise<User> â€” Báº£n ghi tÃ¬m tháº¥y (EN: found record).
     * @sideEffects CÃ³ thá»ƒ nÃ©m NotFoundException náº¿u id khÃ´ng tá»“n táº¡i (EN: may throw NotFoundException if missing).
     */
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<User> {
        return this.usersService.findOne(id)
    }

    /**
     * Táº¡o user má»›i tá»« payload (EN: create a new user from body).
     *
     * @param payload - name/email tÃ¹y chá»n (EN: optional name/email).
     * @returns Promise<User> â€” Báº£n ghi vá»«a táº¡o (EN: newly created record).
     * @sideEffects INSERT vÃ o PostgreSQL (EN: inserts into PostgreSQL).
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() payload: Partial<User>): Promise<User> {
        return this.usersService.create(payload)
    }

    /**
     * Thay tháº¿ toÃ n bá»™ field name/email theo payload (PUT semantics) (EN: full replace of name/email per PUT semantics).
     *
     * @param id - ID user cáº§n cáº­p nháº­t (EN: user id to update).
     * @param payload - GiÃ¡ trá»‹ thay tháº¿ (EN: replacement values).
     * @returns Promise<User> â€” Báº£n ghi sau cáº­p nháº­t (EN: updated record).
     */
    @Put(":id")
    async update(
        @Param("id") id: string,
        @Body() payload: Partial<User>,
    ): Promise<User> {
        return this.usersService.update(id,
            payload)
    }

    /**
     * Cáº­p nháº­t má»™t pháº§n field Ä‘Æ°á»£c gá»­i lÃªn (PATCH semantics) (EN: partial update for provided fields only).
     *
     * @param id - ID user (EN: user id).
     * @param payload - Chá»‰ field Ä‘Æ°á»£c gá»­i má»›i Ä‘á»•i (EN: only sent fields change).
     * @returns Promise<User> â€” Báº£n ghi sau patch (EN: record after patch).
     */
    @Patch(":id")
    async patch(
        @Param("id") id: string,
        @Body() payload: Partial<User>,
    ): Promise<User> {
        return this.usersService.patch(id,
            payload)
    }

    /**
     * XÃ³a user theo id (EN: delete user by id).
     *
     * @param id - ID user cáº§n xÃ³a (EN: user id to delete).
     * @returns Promise<void> â€” KhÃ´ng body khi thÃ nh cÃ´ng (HTTP 204) (EN: no body on success (HTTP 204)).
     * @sideEffects DELETE trÃªn PostgreSQL (EN: deletes PostgreSQL row).
     */
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param("id") id: string): Promise<void> {
        await this.usersService.remove(id)
    }
}
