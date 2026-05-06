/**
 * Service xu ly logic nghiep vu cua User.
 * (EN: Business logic service for User.)
 */
import {
    Injectable, NotFoundException 
} from "@nestjs/common"
import {
    InjectRepository 
} from "@nestjs/typeorm"
import {
    Repository 
} from "typeorm"
import type {
    User 
} from "./interfaces/user.interface"
import {
    UserEntity 
} from "./user.entity"
import type {
    CreateUserDto 
} from "./dto/create-user.dto"

/**
 * Service quáº£n lÃ½ user trÃªn PostgreSQL qua TypeORM â€” nghiá»‡p vá»¥ CRUD tÃ¡ch khá»i controller (EN: user persistence via TypeORM; CRUD logic stays out of controllers).
 * Dá»¯ liá»‡u nháº­n tá»« controller Ä‘Ã£ qua ValidationPipe, Ä‘áº£m báº£o an toÃ n (EN: data from controller is already validated by ValidationPipe).
 */
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>,
    ) {}

    /**
     * Map entity â†’ DTO pháº³ng tráº£ API (EN: map entity to flat API DTO).
     *
     * @param row - Báº£n ghi ORM (EN: ORM row).
     * @returns User â€” Payload JSON cho client (EN: JSON payload for clients).
     */
    private toUser(row: UserEntity): User {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            age: row.age,
        }
    }

    /**
     * Sinh id ngáº¯n chÆ°a tá»“n táº¡i â€” retry giá»›i háº¡n Ä‘á»ƒ trÃ¡nh vÃ²ng láº·p vÃ´ háº¡n (EN: generate short unused id with bounded retries).
     *
     * @returns Promise<string> â€” Id dÃ¹ng cho `POST /users` (EN: id for new user create).
     */
    private async nextUniqueShortId(): Promise<string> {
        for (let attempt = 0; attempt < 32; attempt += 1) {
            const candidate = Math.random().toString(36).substring(7)
            const exists = await this.usersRepo.exist({
                where: {
                    id: candidate 
                },
            })
            if (!exists) {
                return candidate
            }
        }
        throw new Error("Failed to allocate unique user id after retries")
    }

    /**
     * Äá»c toÃ n bá»™ user Ä‘ang lÆ°u (EN: read all stored users).
     *
     * @returns Promise<User[]> â€” Danh sÃ¡ch theo id tÄƒng dáº§n (EN: list ordered by id ascending).
     */
    async findAll(): Promise<User[]> {
        const rows = await this.usersRepo.find({
            order: {
                id: "ASC" 
            },
        })
        return rows.map((r) => this.toUser(r))
    }

    /**
     * TÃ¬m user theo id hoáº·c fail nhanh vá»›i 404 (EN: find by id or fail fast with 404 semantics).
     *
     * @param id - KhÃ³a user (EN: user id).
     * @returns Promise<User> â€” Báº£n ghi tÃ¬m tháº¥y (EN: matched record).
     * @sideEffects NÃ©m NotFoundException khi khÃ´ng cÃ³ báº£n ghi (EN: throws NotFoundException when missing).
     */
    async findOne(id: string): Promise<User> {
        const row = await this.usersRepo.findOne({
            where: {
                id 
            },
        })
        if (!row) {
            throw new NotFoundException(`User with ID ${id} not found`)
        }
        return this.toUser(row)
    }

    /**
     * Táº¡o user má»›i vá»›i id ngáº«u nhiÃªn ngáº¯n â€” nháº­n CreateUserDto Ä‘Ã£ validate (EN: create user with short random id from validated DTO).
     *
     * @param dto - DTO Ä‘Ã£ qua ValidationPipe (EN: validated DTO).
     * @returns Promise<User> â€” Báº£n ghi má»›i Ä‘Ã£ persist (EN: newly persisted record).
     * @sideEffects INSERT vÃ o PostgreSQL (EN: inserts into PostgreSQL).
     */
    async create(dto: CreateUserDto): Promise<User> {
        const id = await this.nextUniqueShortId()
        const entity = this.usersRepo.create({
            id,
            name: dto.name,
            email: dto.email,
            age: dto.age,
        })
        const saved = await this.usersRepo.save(entity)
        return this.toUser(saved)
    }
}
