/**
 * Business logic service for User.
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
} from "./interfaces"
import {
    UserEntity
} from "../../entities"
import type {
    CreateUserDto
} from "./dto"

/** user persistence via TypeORM; CRUD logic stays out of controllers.
 * data from controller is already validated by ValidationPipe.
 */
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>,
    ) {}

    /** map entity to flat API DTO.
     * ORM row.
     * @returns User — JSON payload for clients.
     */
    private toUser(row: UserEntity): User {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            age: row.age,
            address: row.address ?? null,
        }
    }

    /** generate short unused id with bounded retries.
     * id for new user create.
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

    /** read all stored users.
     * list ordered by id ascending.
     */
    async findAll(page = 1, limit = 10): Promise<User[]> {
        // paginate by page/limit already coerced by ValidationPipe.
        const rows = await this.usersRepo.find({
            order: {
                id: "ASC"
            },
            skip: (page - 1) * limit,
            take: limit,
        })
        return rows.map((r) => this.toUser(r))
    }

    /** find by id or fail fast with 404 semantics.
     * user id.
     * matched record.
     * throws NotFoundException when missing.
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

    /** create user with short random id from validated DTO.
     * validated DTO.
     * newly persisted record.
     * inserts into PostgreSQL.
     */
    async create(dto: CreateUserDto): Promise<User> {
        const id = await this.nextUniqueShortId()
        const entity = this.usersRepo.create({
            id,
            name: dto.name,
            email: dto.email,
            age: dto.age,
            address: dto.address ?? null,
        })
        const saved = await this.usersRepo.save(entity)
        return this.toUser(saved)
    }
}
