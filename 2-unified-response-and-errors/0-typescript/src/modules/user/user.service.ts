/**
 * Business logic service for User.
 */
import {
    Injectable 
} from "@nestjs/common"

/** in-memory demo users for envelope lesson.
 */
export interface DemoUser {
    id: number
    name: string
}

/** demo user business logic: list + create.
 */
@Injectable()
export class UsersService {
    private users: DemoUser[] = [
        {
            id: 1,
            name: "John Doe",
        },
    ]

    private nextId = 2

    /** returns all in-memory users.
     * array of demo users.
     */
    findAll(): DemoUser[] {
        return this.users
    }

    /** lookup user by id; returns undefined if missing.
     * user id from URL string.
     * DemoUser or undefined.
     */
    findOne(id: string): DemoUser | undefined {
        const parsed = Number(id)
        if (!Number.isFinite(parsed)) {
            return undefined
        }
        return this.users.find((u) => u.id === parsed)
    }

    /** creates a user with monotonic id.
     * display name.
     * newly created `{ id, name }` record.
     * pushes into the `users` array.
     */
    create(name: string): { id: number; name: string } {
        const user: DemoUser = {
            id: this.nextId++,
            name,
        }
        this.users.push(user)
        return user
    }
}
