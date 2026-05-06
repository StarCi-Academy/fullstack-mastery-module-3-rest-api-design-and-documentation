/**
 * Service xu ly logic nghiep vu cua User.
 * (EN: Business logic service for User.)
 */
import {
    Injectable 
} from "@nestjs/common"

/**
 * User demo lÆ°u trong memory (khÃ´ng DB) â€” Ä‘á»§ cho bÃ i envelope (EN: in-memory demo users for envelope lesson).
 */
export interface DemoUser {
    id: number
    name: string
}

/**
 * Nghiá»‡p vá»¥ users demo: danh sÃ¡ch + táº¡o má»›i (EN: demo user business logic: list + create).
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

    /**
     * Tráº£ toÃ n bá»™ user Ä‘ang lÆ°u trong memory (EN: returns all in-memory users).
     *
     * @returns Máº£ng `DemoUser` (EN: array of demo users).
     */
    findAll(): DemoUser[] {
        return this.users
    }

    /**
     * Táº¡o user má»›i vá»›i id tÄƒng dáº§n (EN: creates a user with monotonic id).
     *
     * @param name - TÃªn hiá»ƒn thá»‹ (EN: display name).
     * @returns Báº£n ghi vá»«a táº¡o `{ id, name }` (EN: newly created `{ id, name }` record).
     * @sideEffects ThÃªm pháº§n tá»­ vÃ o máº£ng `users` (EN: pushes into the `users` array).
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
