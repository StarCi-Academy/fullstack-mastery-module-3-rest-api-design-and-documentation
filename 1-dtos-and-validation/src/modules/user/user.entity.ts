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
 * Báº£n ghi user trÃªn PostgreSQL â€” map báº£ng `users` cho TypeORM (EN: user row mapped to `users` table).
 * DÃ¹ng `id` kiá»ƒu chuá»—i (á»©ng dá»¥ng gÃ¡n: id ngáº¯n khi `POST`) (EN: string ids assigned by app on create).
 */
@Entity({
    name: "users",
})
export class UserEntity {
    /**
     * KhÃ³a chÃ­nh do á»©ng dá»¥ng gÃ¡n (random ngáº¯n khi táº¡o) (EN: application-assigned primary key).
     */
    @PrimaryColumn({
        type: "varchar", length: 36,
    })
        id: string

    @Column({
        type: "varchar", length: 255,
    })
        name: string

    @Column({
        type: "varchar", length: 255,
    })
        email: string

    @Column({
        type: "int",
    })
        age: number
}
