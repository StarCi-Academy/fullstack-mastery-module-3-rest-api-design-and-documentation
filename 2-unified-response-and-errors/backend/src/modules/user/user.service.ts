/**
 * Service xu ly logic nghiep vu cua User.
 * (EN: Business logic service for User.)
 */
import {
    Injectable 
} from "@nestjs/common"

/**
 * User demo lưu trong memory (không DB) — đủ cho bài envelope (EN: in-memory demo users for envelope lesson).
 */
export interface DemoUser {
    id: number
    name: string
}

/**
 * Nghiệp vụ users demo: danh sách + tạo mới (EN: demo user business logic: list + create).
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
     * Trả toàn bá»™ user đang lưu trong memory (EN: returns all in-memory users).
     *
     * @returns Mảng `DemoUser` (EN: array of demo users).
     */
    findAll(): DemoUser[] {
        return this.users
    }

    /**
     * Tra cứu user theo id, trả undefined nếu không có (EN: lookup user by id; returns undefined if missing).
     *
     * @param id - Khoá id user dưới dạng chuỗi từ URL (EN: user id from URL string).
     * @returns DemoUser hoặc undefined (EN: DemoUser or undefined).
     */
    findOne(id: string): DemoUser | undefined {
        const parsed = Number(id)
        if (!Number.isFinite(parsed)) {
            return undefined
        }
        return this.users.find((u) => u.id === parsed)
    }

    /**
     * Tạo user mới với id tÄƒng dần (EN: creates a user with monotonic id).
     *
     * @param name - Tên hiá»ƒn thị (EN: display name).
     * @returns Bản ghi vừa tạo `{ id, name }` (EN: newly created `{ id, name }` record).
     * @sideEffects Thêm phần tử vào mảng `users` (EN: pushes into the `users` array).
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
