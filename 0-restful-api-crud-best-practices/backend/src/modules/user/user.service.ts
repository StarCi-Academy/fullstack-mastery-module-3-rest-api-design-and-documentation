/**
 * Service xu ly logic nghiep vu cua User.
 * (EN: Business logic service for User.)
 */
import {
    faker 
} from "@faker-js/faker"
import {
    Injectable, NotFoundException 
} from "@nestjs/common"
import {
    InjectRepository 
} from "@nestjs/typeorm"
import {
    Repository 
} from "typeorm"
import {
    User 
} from "./interfaces/user.interface"
import {
    UserEntity 
} from "../../entities"

/**
 * Service quản lý user trên PostgreSQL qua TypeORM — nghiệp vụ CRUD tách khá»i controller (EN: user persistence via TypeORM; CRUD logic stays out of controllers).
 * Tuân thủ repo rule: không nhồi logic vào controller (EN: keeps controllers free of business rules).
 */
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>,
    ) {}

    /**
     * Xóa toàn bá»™ bản ghi `users` — chỉ dùng cho endpoint demo dá»n seed (EN: wipe all rows; demo cleanup only).
     *
     * @returns Promise<void> — Hoàn tất sau khi bảng rỗng (EN: resolves when table is empty).
     * @sideEffects DELETE toàn bá»™ trên bảng `users` (EN: deletes every row in `users`).
     */
    async removeAll(): Promise<void> {
        await this.usersRepo.clear()
    }

    /**
     * Tạo đúng má»™t user với `name`/`email` từ **@faker-js/faker** — `faker.seed(1337)` Ä‘á»ƒ output ổn định cho tài liệu (EN: insert one user; fixed faker seed for reproducible lesson samples).
     *
     * @returns Promise<User> — Bản ghi vừa tạo (EN: newly created row).
     * @sideEffects INSERT má»™t dòng (EN: inserts one row).
     */
    async seedOneWithFaker(): Promise<User> {
        faker.seed(1337)
        const name = faker.person.fullName()
        const first = name.split(" ")[0] ?? "user"
        const email = faker.internet.email({
            firstName: first,
        })
        const id = await this.nextUniqueShortId()
        const entity = this.usersRepo.create({
            id,
            name,
            email,
        })
        const saved = await this.usersRepo.save(entity)
        return this.toUser(saved)
    }

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
        }
    }

    /**
     * Sinh id ngắn chưa tồn tại — retry giới hạn Ä‘á»ƒ tránh vòng lặp vô hạn (EN: generate short unused id with bounded retries).
     *
     * @returns Promise<string> — Id dùng cho `POST /users` (EN: id for new user create).
     */
    private async nextUniqueShortId(): Promise<string> {
        // Giới hạn số lần thử Ä‘á»ƒ tránh treo nếu entropy kém (EN: cap attempts to avoid a tight loop on bad luck).
        for (let attempt = 0; attempt < 32; attempt += 1) {
            const candidate = Math.random().toString(36).substring(7)
            // Kiá»ƒm tra trùng khóa trước khi insert (EN: check duplicate key before insert).
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
        // Order cố định giúp curl dễ đối chiếu giữa các lần chạy (EN: stable order helps curl comparisons across runs).
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
     * Tạo user mới với id ngẫu nhiên ngắn (EN: create user with short random id).
     *
     * @param payload - name/email tùy chá»n (EN: optional name/email).
     * @returns Promise<User> — Bản ghi mới đã persist (EN: newly persisted record).
     * @sideEffects INSERT vào PostgreSQL (EN: inserts into PostgreSQL).
     */
    async create(payload: Partial<User>): Promise<User> {
        const id = await this.nextUniqueShortId()
        const entity = this.usersRepo.create({
            id,
            name: payload.name ?? "Anonymous",
            email: payload.email ?? "no-email@example.com",
        })
        const saved = await this.usersRepo.save(entity)
        return this.toUser(saved)
    }

    /**
     * PUT: ghi đè name/email (fallback giữ giá trị cũ nếu field thiếu) (EN: PUT overwrites name/email, falling back to previous values when missing).
     *
     * @param id - User cần cập nhật (EN: user to update).
     * @param payload - Giá trị mới (EN: new values).
     * @returns Promise<User> — Entity sau khi ghi (EN: entity after write).
     * @sideEffects UPDATE trên PostgreSQL (EN: updates PostgreSQL row).
     */
    async update(id: string, payload: Partial<User>): Promise<User> {
        const row = await this.usersRepo.findOne({
            where: {
                id 
            },
        })
        if (!row) {
            throw new NotFoundException(`User with ID ${id} not found`)
        }
        row.name = payload.name ?? row.name
        row.email = payload.email ?? row.email
        const saved = await this.usersRepo.save(row)
        return this.toUser(saved)
    }

    /**
     * PATCH: chỉ đổi field được gửi (EN: PATCH updates only provided fields).
     *
     * @param id - User cần patch (EN: user to patch).
     * @param payload - Partial update (EN: partial update body).
     * @returns Promise<User> — Entity sau patch (EN: entity after patch).
     */
    async patch(id: string, payload: Partial<User>): Promise<User> {
        const row = await this.usersRepo.findOne({
            where: {
                id 
            },
        })
        if (!row) {
            throw new NotFoundException(`User with ID ${id} not found`)
        }
        if (payload.name !== undefined) {
            row.name = payload.name
        }
        if (payload.email !== undefined) {
            row.email = payload.email
        }
        const saved = await this.usersRepo.save(row)
        return this.toUser(saved)
    }

    /**
     * Xóa user — không tìm thấy thì lỗi rõ ràng (EN: delete user; missing id throws clearly).
     *
     * @param id - User cần xóa (EN: user id to delete).
     * @returns Promise<void> — Không body khi thành công ở HTTP layer (EN: void; HTTP 204 on success).
     * @sideEffects DELETE trên PostgreSQL (EN: deletes PostgreSQL row).
     */
    async remove(id: string): Promise<void> {
        const result = await this.usersRepo.delete({
            id 
        })
        if (!result.affected || result.affected === 0) {
            throw new NotFoundException("Cannot delete: User not found")
        }
    }
}
