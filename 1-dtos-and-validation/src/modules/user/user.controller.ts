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
    Param,
    Post,
} from "@nestjs/common"
import type {
    User 
} from "./interfaces/user.interface"
import {
    UserService 
} from "./user.service"
import {
    CreateUserDto 
} from "./dto/create-user.dto"

/**
 * HTTP adapter cho resource users — minh hoạ DTO + ValidationPipe bảo vệ endpoint (EN: HTTP adapter for users; demonstrates DTO + ValidationPipe protection).
 */
@Controller("users")
export class UserController {
    constructor(private readonly usersService: UserService) {}

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
     * Tạo user mới — body bắt buá»™c khớp CreateUserDto, nếu không ValidationPipe trả 400 (EN: create user; body must match CreateUserDto or ValidationPipe returns 400).
     *
     * @param createUserDto - DTO đã qua ValidationPipe (EN: validated DTO).
     * @returns Promise<User> — Bản ghi vừa tạo (EN: newly created record).
     * @sideEffects INSERT vào PostgreSQL (EN: inserts into PostgreSQL).
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto)
    }
}
