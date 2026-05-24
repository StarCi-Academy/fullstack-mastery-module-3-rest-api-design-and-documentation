/**
 * Entity TypeORM — thuc the User.
 * (EN: TypeORM entity — User entity.)
 */
import {
    Column,
    Entity,
    PrimaryColumn,
} from "typeorm"

/**
 * Bản ghi user trên PostgreSQL — map bảng `users` cho TypeORM (EN: user row mapped to `users` table).
 * Dùng `id` kiểu chuỗi (ứng dụng gán: id ngắn khi `POST`) (EN: string ids assigned by app on create).
 */
@Entity({
    name: "users",
})
export class UserEntity {
    /**
     * Khóa chính do ứng dụng gán (random ngắn khi tạo) (EN: application-assigned primary key).
     */
    @PrimaryColumn({
        type: "varchar", length: 36,
    })
        id!: string

    @Column({
        type: "varchar", length: 255,
    })
        name!: string

    @Column({
        type: "varchar", length: 255,
    })
        email!: string
}
