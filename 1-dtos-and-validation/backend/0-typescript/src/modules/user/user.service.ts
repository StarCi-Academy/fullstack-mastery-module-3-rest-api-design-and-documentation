/**
 * Business logic service for the User resource.
 *
 * Data received from the controller has already been validated by the global ValidationPipe,
 * so this service can assume all inputs satisfy the DTO contract without re-checking.
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

/**
 * UserService — encapsulates all user CRUD operations.
 *
 * The service is injected into UserController via NestJS DI and has no knowledge of HTTP.
 * It works with the TypeORM repository to persist and query UserEntity rows.
 */
@Injectable()
export class UserService {
    constructor(
        // TypeORM repository scoped to UserEntity — injected by NestJS DI.
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>,
    ) {}

    /**
     * Map a UserEntity ORM row to the flat User API shape returned to clients.
     * Keeps the controller and service independent of the ORM column layout.
     *
     * @param row - Raw ORM entity retrieved from the database.
     * @returns User — lean JSON-serialisable payload for the HTTP response.
     */
    private toUser(row: UserEntity): User {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            age: row.age,
            // Normalise missing address to explicit null so the JSON shape is consistent.
            address: row.address ?? null,
        }
    }

    /**
     * Generate a short unique id for a new user by retrying until a collision-free candidate is found.
     * The retry bound (32) prevents an infinite loop in the unlikely event of a full id space.
     *
     * @returns Promise<string> — a 6-character base-36 string not yet present in the store.
     * @throws Error if 32 consecutive attempts all collide (practically impossible in dev).
     */
    private async nextUniqueShortId(): Promise<string> {
        for (let attempt = 0; attempt < 32; attempt += 1) {
            // substring(7) of a base-36 random string gives a 6-char alphanumeric id.
            const candidate = Math.random().toString(36).substring(7)
            // Check the store to ensure the candidate is not already taken.
            const exists = await this.usersRepo.exist({
                where: {
                    id: candidate
                },
            })
            // Return immediately on the first free candidate — no lock needed for a demo store.
            if (!exists) {
                return candidate
            }
        }
        throw new Error("Failed to allocate unique user id after retries")
    }

    /**
     * Return a paginated slice of all users ordered by id.
     *
     * @param page - 1-based page number (default 1).
     * @param limit - Items per page (default 10).
     * @returns Promise<User[]> — the requested page of users, possibly empty.
     */
    async findAll(page = 1, limit = 10): Promise<User[]> {
        // Compute the zero-based row offset from the 1-based page number.
        const rows = await this.usersRepo.find({
            order: {
                id: "ASC"  // Stable sort so pagination is deterministic across calls.
            },
            skip: (page - 1) * limit,  // OFFSET: skip rows from earlier pages.
            take: limit,               // LIMIT: take exactly `limit` rows.
        })
        // Convert every ORM row to the lightweight API shape before returning.
        return rows.map((r) => this.toUser(r))
    }

    /**
     * Fetch a single user by primary key — fail fast with a 404 if not found.
     *
     * @param id - The user's identifier.
     * @returns Promise<User> — the found user record.
     * @throws NotFoundException (HTTP 404) when no user with that id exists.
     */
    async findOne(id: string): Promise<User> {
        const row = await this.usersRepo.findOne({
            where: {
                id
            },
        })
        // Throw early so the controller never receives a null value — NestJS maps this to HTTP 404.
        if (!row) {
            throw new NotFoundException(`User with ID ${id} not found`)
        }
        return this.toUser(row)
    }

    /**
     * Persist a new user built from a validated DTO.
     *
     * @param dto - The validated CreateUserDto from the global ValidationPipe.
     * @returns Promise<User> — the newly persisted user with its generated id.
     * @sideEffects Writes a new row to the users table (or in-memory store in the demo).
     */
    async create(dto: CreateUserDto): Promise<User> {
        // Generate a collision-free short id before inserting.
        const id = await this.nextUniqueShortId()
        // Build an entity instance from the DTO fields (TypeORM create() does NOT persist yet).
        const entity = this.usersRepo.create({
            id,
            name: dto.name,
            email: dto.email,
            age: dto.age,
            // Normalise absent address to null to keep the column non-undefined.
            address: dto.address ?? null,
        })
        // save() performs the INSERT and returns the persisted entity with any DB-generated values.
        const saved = await this.usersRepo.save(entity)
        return this.toUser(saved)
    }
}
