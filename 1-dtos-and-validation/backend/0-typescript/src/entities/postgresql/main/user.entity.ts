/**
 * TypeORM entity mapping to the `users` table in PostgreSQL.
 *
 * The entity is kept separate from the API interface (User) and the input DTO (CreateUserDto).
 * Mixing entity + DTO would expose internal columns and open mass-assignment vulnerabilities.
 */
import {
    Column,
    Entity,
    PrimaryColumn,
} from "typeorm"

/**
 * Persistent user record stored in the `users` table.
 * The application (not the database) assigns the primary key on creation.
 */
@Entity({
    name: "users",
})
export class UserEntity {
    /**
     * Short application-assigned unique identifier (e.g. "wl03f8").
     * Stored as varchar(36) to accommodate UUIDs if the id scheme changes later.
     */
    @PrimaryColumn({
        type: "varchar", length: 36,
    })
        id!: string

    /**
     * Validated display name — minimum 3 characters (enforced at the API boundary).
     */
    @Column({
        type: "varchar", length: 255,
    })
        name!: string

    /**
     * Validated email address (enforced at the API boundary).
     */
    @Column({
        type: "varchar", length: 255,
    })
        email!: string

    /**
     * Age in years — integer in [18, 100] (enforced at the API boundary).
     */
    @Column({
        type: "int",
    })
        age!: number

    /**
     * Optional postal address stored as JSONB so the schema is flexible.
     * Null when the user did not supply an address.
     * The nested shape {city, zip} is enforced by AddressDto at the API boundary.
     */
    @Column({
        type: "jsonb", nullable: true,
    })
        address?: { city: string; zip: string } | null
}
