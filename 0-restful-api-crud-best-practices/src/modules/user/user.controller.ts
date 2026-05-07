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
 * HTTP adapter cho resource users — không chứa nghiệp vụ, chỉ ủy quyá»n cho service (EN: HTTP adapter; delegates to service only).
 */
@Controller("users")
export class UserController {
    constructor(private readonly usersService: UserService) {}

    /**
     * Demo: xóa hết bản ghi `users` (dá»n seed / reset bài lab) (EN: demo wipe-all for lesson reset).
     *
     * @returns Promise<void> — **HTTP 204** không body (EN: **HTTP 204** no body).
     */
    @Delete("demo/clear-all")
    @HttpCode(HttpStatus.NO_CONTENT)
    async demoClearAll(): Promise<void> {
        await this.usersService.removeAll()
    }

    /**
     * Demo: tạo má»™t user bằng **@faker-js/faker** (`faker.seed(1337)`) (EN: demo insert one faker-backed user).
     *
     * @returns Promise<User> — **HTTP 201** + JSON user (EN: **HTTP 201** + user JSON).
     */
    @Post("demo/seed-one")
    @HttpCode(HttpStatus.CREATED)
    async demoSeedOne(): Promise<User> {
        return this.usersService.seedOneWithFaker()
    }

    /**
     * Trả danh sách user hiện có trong PostgreSQL (EN: return all users from PostgreSQL).
     *
     * @returns Promise<User[]> — Mảng user (có thá»ƒ rỗng) (EN: user array, possibly empty).
     */
    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll()
    }

    /**
     * Lấy má»™t user theo id (EN: fetch one user by id).
     *
     * @param id - Khóa định danh user (EN: user identifier).
     * @returns Promise<User> — Bản ghi tìm thấy (EN: found record).
     * @sideEffects Có thá»ƒ ném NotFoundException nếu id không tồn tại (EN: may throw NotFoundException if missing).
     */
    @Get(":id")
    async findOne(@Param("id") id: string): Promise<User> {
        return this.usersService.findOne(id)
    }

    /**
     * Tạo user mới từ payload (EN: create a new user from body).
     *
     * @param payload - name/email tùy chá»n (EN: optional name/email).
     * @returns Promise<User> — Bản ghi vừa tạo (EN: newly created record).
     * @sideEffects INSERT vào PostgreSQL (EN: inserts into PostgreSQL).
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() payload: Partial<User>): Promise<User> {
        return this.usersService.create(payload)
    }

    /**
     * Thay thế toàn bá»™ field name/email theo payload (PUT semantics) (EN: full replace of name/email per PUT semantics).
     *
     * @param id - ID user cần cập nhật (EN: user id to update).
     * @param payload - Giá trị thay thế (EN: replacement values).
     * @returns Promise<User> — Bản ghi sau cập nhật (EN: updated record).
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
     * Cập nhật má»™t phần field được gửi lên (PATCH semantics) (EN: partial update for provided fields only).
     *
     * @param id - ID user (EN: user id).
     * @param payload - Chỉ field được gửi mới đổi (EN: only sent fields change).
     * @returns Promise<User> — Bản ghi sau patch (EN: record after patch).
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
     * Xóa user theo id (EN: delete user by id).
     *
     * @param id - ID user cần xóa (EN: user id to delete).
     * @returns Promise<void> — Không body khi thành công (HTTP 204) (EN: no body on success (HTTP 204)).
     * @sideEffects DELETE trên PostgreSQL (EN: deletes PostgreSQL row).
     */
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param("id") id: string): Promise<void> {
        await this.usersService.remove(id)
    }
}
