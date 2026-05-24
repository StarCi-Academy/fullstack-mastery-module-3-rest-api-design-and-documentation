/**
 * AppModule — dang ky cac thanh phan cua feature App.
 * (EN: AppModule — registers components for App feature.)
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
 * Root module — Config + TypeORM + ValidationPipe demo modules cho bài DTOs & Validation + PostgreSQL (EN: root module wiring config, TypeORM, and demo domains).
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig],
        }),
        TypeOrmModule.forRootAsync({
            inject: [databaseConfig.KEY],
            useFactory: (dbConfig: DatabaseConfig) => ({
                type: "postgres",
                host: dbConfig.postgres.host,
                port: dbConfig.postgres.port,
                username: dbConfig.postgres.username,
                password: dbConfig.postgres.password,
                database: dbConfig.postgres.database,
                entities: [UserEntity],
                synchronize: true,
            }),
        }),
        UserModule,
    ],
})
export class AppModule { }
