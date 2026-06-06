import {
    registerAs
} from "@nestjs/config"

/** Shape of PostgreSQL connection parameters read from environment variables.
 * Centralising the shape here makes TypeScript enforce every property at injection points.
 */
export interface DatabaseConfig {
    /** Postgres connection sub-group — all properties are read from env at startup. */
    postgres: {
        /** Postgres server hostname; default "localhost" for Docker-on-host. */
        host: string
        /** Postgres server port; default 5432. */
        port: number
        /** Login username; default "postgres". */
        username: string
        /** Login password; default "postgres". */
        password: string
        /** Database name; default "restful_demo". */
        database: string
    }
}

/** NestJS config token for the PostgreSQL config group.
 * Injected via `@Inject(databaseConfig.KEY)` in TypeOrmModule.forRootAsync.
 * Reading from environment allows the same binary to connect to any Postgres instance.
 */
export const databaseConfig = registerAs("database",
    (): DatabaseConfig => ({
        postgres: {
            // Fall back to Docker-default values so the app starts without a .env file in dev.
            host: process.env.POSTGRES_HOST ?? "localhost",
            port: Number(process.env.POSTGRES_PORT) || 5432,
            username: process.env.POSTGRES_USER ?? "postgres",
            password: process.env.POSTGRES_PASSWORD ?? "postgres",
            database: process.env.POSTGRES_DB ?? "restful_demo",
        },
    }))
