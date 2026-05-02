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
     * Trả toàn bộ user đang lưu trong memory (EN: returns all in-memory users).
     *
     * @returns Mảng `DemoUser` (EN: array of demo users).
     */
    findAll(): DemoUser[] {
        return this.users
    }

    /**
     * Tạo user mới với id tăng dần (EN: creates a user with monotonic id).
     *
     * @param name - Tên hiển thị (EN: display name).
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
