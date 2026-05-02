import {
    Module 
} from "@nestjs/common"
import {
    ConfigModule, ConfigService 
} from "@nestjs/config"
import {
    TypeOrmModule 
} from "@nestjs/typeorm"
import {
    UserEntity, UserModule 
} from "./modules/user"

/**
 * Root module — Config + TypeORM + ValidationPipe demo modules cho bài DTOs & Validation + PostgreSQL (EN: root module wiring config, TypeORM, and demo domains).
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env"],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: "postgres",
                host: config.get<string>("DATABASE_HOST",
                    "localhost"),
                port: config.get<number>("DATABASE_PORT",
                    5432),
                username: config.get<string>("DATABASE_USERNAME",
                    "postgres"),
                password: config.get<string>("DATABASE_PASSWORD",
                    "postgres"),
                database: config.get<string>("DATABASE_NAME",
                    "dto_validation_demo"),
                entities: [UserEntity],
                synchronize: config.get<string>("TYPEORM_SYNC",
                    "true") === "true",
            }),
        }),
        UserModule,
    ],
})
export class AppModule {}
