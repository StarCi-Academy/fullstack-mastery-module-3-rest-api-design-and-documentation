/**
 * AppModule — root NestJS module that wires together configuration, the database
 * connection, and all feature sub-modules.
 *
 * Keeps the composition root separate from business logic: AppModule only imports,
 * while UserModule owns the actual controllers and services.
 */
import {
    Module
} from "@nestjs/common"
import {
    ConfigModule
} from "@nestjs/config"
import {
    TypeOrmModule
} from "@nestjs/typeorm"
import {
    databaseConfig, DatabaseConfig
} from "./config"
import {
    UserEntity
} from "./entities"
import {
    UserModule
} from "./modules"

/**
 * Root application module.
 *
 * Import order matters: ConfigModule must be registered globally before TypeOrmModule
 * so that TypeOrmModule.forRootAsync can inject the resolved database configuration.
 */
@Module({
    imports: [
        // ConfigModule loads .env values and makes them available via @ConfigType tokens.
        // isGlobal: true means sub-modules do not need to re-import ConfigModule.
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig],  // Register the typed databaseConfig factory.
        }),

        // TypeOrmModule connects to PostgreSQL using values from databaseConfig.
        // forRootAsync + inject pattern ensures the config is fully resolved before use.
        TypeOrmModule.forRootAsync({
            inject: [databaseConfig.KEY],
            useFactory: (dbConfig: DatabaseConfig) => ({
                type: "postgres",
                host: dbConfig.postgres.host,
                port: dbConfig.postgres.port,
                username: dbConfig.postgres.username,
                password: dbConfig.postgres.password,
                database: dbConfig.postgres.database,
                entities: [UserEntity],  // Register all entities to be managed by TypeORM.
                // synchronize: auto-create/alter tables on startup.
                // Safe for the demo; disable in production (use migrations instead).
                synchronize: true,
            }),
        }),

        // Feature module for the User resource (controller + service + DTO validation).
        UserModule,
    ],
})
export class AppModule { }
