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
 * Service quản lý user trên PostgreSQL qua TypeORM — nghiệp vụ CRUD tách khá»i controller (EN: user persistence via TypeORM; CRUD logic stays out of controllers).
 * Dữ liệu nhận từ controller đã qua ValidationPipe, đảm bảo an toàn (EN: data from controller is already validated by ValidationPipe).
 */
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>,
    ) {}

    /**
     * Map entity → DTO phẳng trả API (EN: map entity to flat API DTO).
     *
     * @param row - Bản ghi ORM (EN: ORM row).
     * @returns User — Payload JSON cho client (EN: JSON payload for clients).
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
     * Sinh id ngắn chưa tồn tại — retry giới hạn Ä‘á»ƒ tránh vòng lặp vô hạn (EN: generate short unused id with bounded retries).
     *
     * @returns Promise<string> — Id dùng cho `POST /users` (EN: id for new user create).
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
     * Äá»c toàn bá»™ user đang lưu (EN: read all stored users).
     *
     * @returns Promise<User[]> — Danh sách theo id tÄƒng dần (EN: list ordered by id ascending).
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
     * Tìm user theo id hoặc fail nhanh với 404 (EN: find by id or fail fast with 404 semantics).
     *
     * @param id - Khóa user (EN: user id).
     * @returns Promise<User> — Bản ghi tìm thấy (EN: matched record).
     * @sideEffects Ném NotFoundException khi không có bản ghi (EN: throws NotFoundException when missing).
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
     * Tạo user mới với id ngẫu nhiên ngắn — nhận CreateUserDto đã validate (EN: create user with short random id from validated DTO).
     *
     * @param dto - DTO đã qua ValidationPipe (EN: validated DTO).
     * @returns Promise<User> — Bản ghi mới đã persist (EN: newly persisted record).
     * @sideEffects INSERT vào PostgreSQL (EN: inserts into PostgreSQL).
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
