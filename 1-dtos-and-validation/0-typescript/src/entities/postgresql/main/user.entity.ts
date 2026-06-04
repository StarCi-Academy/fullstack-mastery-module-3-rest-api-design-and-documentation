/**
 * TypeORM entity — User entity.
 */
import {
    Column,
    Entity,
    PrimaryColumn,
} from "typeorm"

/** user row mapped to `users` table.
 * string ids assigned by app on create.
 */
@Entity({
    name: "users",
})
export class UserEntity {
    /** application-assigned primary key.
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

    @Column({
        type: "int",
    })
        age!: number

    /** optional JSON address — supports nested DTO demo.
     */
    @Column({
        type: "jsonb", nullable: true,
    })
        address?: { city: string; zip: string } | null
}
