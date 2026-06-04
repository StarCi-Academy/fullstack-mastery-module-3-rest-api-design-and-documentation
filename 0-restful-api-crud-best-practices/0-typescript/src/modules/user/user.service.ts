/** Business logic service for User.
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

/** user persistence via TypeORM; CRUD logic stays out of controllers.
 * keeps controllers free of business rules.
 */
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>,
    ) {}

    /** wipe all rows; demo cleanup only.
     * resolves when table is empty.
     * deletes every row in `users`.
     */
    async removeAll(): Promise<void> {
        await this.usersRepo.clear()
    }

    /** insert one user; fixed faker seed for reproducible lesson samples.
     * newly created row.
     * inserts one row.
     */
    async seedOneWithFaker(): Promise<User> {
        faker.seed(1337)
        const name = faker.person.fullName()
        const first = name.split(" ")[0] ?? "user"
        const email = faker.internet.email({ firstName: first })
        const id = await this.nextUniqueShortId()
        const entity = this.usersRepo.create({ id, name, email })
        const saved = await this.usersRepo.save(entity)
        return this.toUser(saved)
    }

    /** map entity to flat API DTO.
     * ORM row.
     * @returns User — JSON payload for clients.
     */
    private toUser(row: UserEntity): User {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
        }
    }

    /** generate short unused id with bounded retries.
     * id for new user create.
     */
    private async nextUniqueShortId(): Promise<string> {
        // cap attempts to avoid a tight loop on bad luck.
        for (let attempt = 0; attempt < 32; attempt += 1) {
            const candidate = Math.random().toString(36).substring(7)
            // check duplicate key before insert.
            const exists = await this.usersRepo.exist({ where: { id: candidate } })
            if (!exists) {
                return candidate
            }
        }
        throw new Error("Failed to allocate unique user id after retries")
    }

    /** read all stored users.
     * list ordered by id ascending.
     */
    async findAll(): Promise<User[]> {
        // stable order helps curl comparisons across runs.
        const rows = await this.usersRepo.find({ order: { id: "ASC" } })
        return rows.map((r) => this.toUser(r))
    }

    /** find by id or fail fast with 404 semantics.
     * user id.
     * matched record.
     * throws NotFoundException when missing.
     */
    async findOne(id: string): Promise<User> {
        const row = await this.usersRepo.findOne({ where: { id } })
        if (!row) {
            throw new NotFoundException(`User with ID ${id} not found`)
        }
        return this.toUser(row)
    }

    /** create user with short random id.
     * optional name/email.
     * newly persisted record.
     * inserts into PostgreSQL.
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

    /** PUT fully replaces name/email from the complete payload; no fallback to previous values.
     * user to update.
     * full representation that replaces the existing row.
     * @returns Promise<User> — entity after write.
     * updates PostgreSQL row.
     */
    async update(id: string, payload: User): Promise<User> {
        const row = await this.usersRepo.findOne({ where: { id } })
        if (!row) {
            throw new NotFoundException(`User with ID ${id} not found`)
        }
        row.name = payload.name
        row.email = payload.email
        const saved = await this.usersRepo.save(row)
        return this.toUser(saved)
    }

    /** PATCH updates only provided fields.
     * user to patch.
     * @param payload - partial update body.
     * @returns Promise<User> — entity after patch.
     */
    async patch(id: string, payload: Partial<User>): Promise<User> {
        const row = await this.usersRepo.findOne({ where: { id } })
        if (!row) throw new NotFoundException(`User with ID ${id} not found`)
        if (payload.name !== undefined) row.name = payload.name
        if (payload.email !== undefined) row.email = payload.email
        return this.toUser(await this.usersRepo.save(row))
    }

    /** delete user; missing id throws clearly.
     * user id to delete.
     * void; HTTP 204 on success.
     * deletes PostgreSQL row.
     */
    async remove(id: string): Promise<void> {
        const result = await this.usersRepo.delete({ id })
        if (!result.affected || result.affected === 0) {
            throw new NotFoundException("Cannot delete: User not found")
        }
    }
}
