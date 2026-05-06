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
 * HTTP adapter cho resource users â€” minh hoáº¡ DTO + ValidationPipe báº£o vá»‡ endpoint (EN: HTTP adapter for users; demonstrates DTO + ValidationPipe protection).
 */
@Controller("users")
export class UserController {
    constructor(private readonly usersService: UserService) {}

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
     * Táº¡o user má»›i â€” body báº¯t buá»™c khá»›p CreateUserDto, náº¿u khÃ´ng ValidationPipe tráº£ 400 (EN: create user; body must match CreateUserDto or ValidationPipe returns 400).
     *
     * @param createUserDto - DTO Ä‘Ã£ qua ValidationPipe (EN: validated DTO).
     * @returns Promise<User> â€” Báº£n ghi vá»«a táº¡o (EN: newly created record).
     * @sideEffects INSERT vÃ o PostgreSQL (EN: inserts into PostgreSQL).
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto)
    }
}
