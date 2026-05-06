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
} from "./user.entity"

/**
 * Service quáº£n lÃ½ user trÃªn PostgreSQL qua TypeORM â€” nghiá»‡p vá»¥ CRUD tÃ¡ch khá»i controller (EN: user persistence via TypeORM; CRUD logic stays out of controllers).
 * TuÃ¢n thá»§ repo rule: khÃ´ng nhá»“i logic vÃ o controller (EN: keeps controllers free of business rules).
 */
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>,
    ) {}

    /**
     * XÃ³a toÃ n bá»™ báº£n ghi `users` â€” chá»‰ dÃ¹ng cho endpoint demo dá»n seed (EN: wipe all rows; demo cleanup only).
     *
     * @returns Promise<void> â€” HoÃ n táº¥t sau khi báº£ng rá»—ng (EN: resolves when table is empty).
     * @sideEffects DELETE toÃ n bá»™ trÃªn báº£ng `users` (EN: deletes every row in `users`).
     */
    async removeAll(): Promise<void> {
        await this.usersRepo.clear()
    }

    /**
     * Táº¡o Ä‘Ãºng má»™t user vá»›i `name`/`email` tá»« **@faker-js/faker** â€” `faker.seed(1337)` Ä‘á»ƒ output á»•n Ä‘á»‹nh cho tÃ i liá»‡u (EN: insert one user; fixed faker seed for reproducible lesson samples).
     *
     * @returns Promise<User> â€” Báº£n ghi vá»«a táº¡o (EN: newly created row).
     * @sideEffects INSERT má»™t dÃ²ng (EN: inserts one row).
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
        }
    }

    /**
     * Sinh id ngáº¯n chÆ°a tá»“n táº¡i â€” retry giá»›i háº¡n Ä‘á»ƒ trÃ¡nh vÃ²ng láº·p vÃ´ háº¡n (EN: generate short unused id with bounded retries).
     *
     * @returns Promise<string> â€” Id dÃ¹ng cho `POST /users` (EN: id for new user create).
     */
    private async nextUniqueShortId(): Promise<string> {
        // Giá»›i háº¡n sá»‘ láº§n thá»­ Ä‘á»ƒ trÃ¡nh treo náº¿u entropy kÃ©m (EN: cap attempts to avoid a tight loop on bad luck).
        for (let attempt = 0; attempt < 32; attempt += 1) {
            const candidate = Math.random().toString(36).substring(7)
            // Kiá»ƒm tra trÃ¹ng khÃ³a trÆ°á»›c khi insert (EN: check duplicate key before insert).
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
        // Order cá»‘ Ä‘á»‹nh giÃºp curl dá»… Ä‘á»‘i chiáº¿u giá»¯a cÃ¡c láº§n cháº¡y (EN: stable order helps curl comparisons across runs).
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
     * Táº¡o user má»›i vá»›i id ngáº«u nhiÃªn ngáº¯n (EN: create user with short random id).
     *
     * @param payload - name/email tÃ¹y chá»n (EN: optional name/email).
     * @returns Promise<User> â€” Báº£n ghi má»›i Ä‘Ã£ persist (EN: newly persisted record).
     * @sideEffects INSERT vÃ o PostgreSQL (EN: inserts into PostgreSQL).
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
     * PUT: ghi Ä‘Ã¨ name/email (fallback giá»¯ giÃ¡ trá»‹ cÅ© náº¿u field thiáº¿u) (EN: PUT overwrites name/email, falling back to previous values when missing).
     *
     * @param id - User cáº§n cáº­p nháº­t (EN: user to update).
     * @param payload - GiÃ¡ trá»‹ má»›i (EN: new values).
     * @returns Promise<User> â€” Entity sau khi ghi (EN: entity after write).
     * @sideEffects UPDATE trÃªn PostgreSQL (EN: updates PostgreSQL row).
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
     * PATCH: chá»‰ Ä‘á»•i field Ä‘Æ°á»£c gá»­i (EN: PATCH updates only provided fields).
     *
     * @param id - User cáº§n patch (EN: user to patch).
     * @param payload - Partial update (EN: partial update body).
     * @returns Promise<User> â€” Entity sau patch (EN: entity after patch).
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
     * XÃ³a user â€” khÃ´ng tÃ¬m tháº¥y thÃ¬ lá»—i rÃµ rÃ ng (EN: delete user; missing id throws clearly).
     *
     * @param id - User cáº§n xÃ³a (EN: user id to delete).
     * @returns Promise<void> â€” KhÃ´ng body khi thÃ nh cÃ´ng á»Ÿ HTTP layer (EN: void; HTTP 204 on success).
     * @sideEffects DELETE trÃªn PostgreSQL (EN: deletes PostgreSQL row).
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
