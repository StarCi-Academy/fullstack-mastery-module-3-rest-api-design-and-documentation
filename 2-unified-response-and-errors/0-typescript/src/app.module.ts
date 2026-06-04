/**
 * AppModule — registers components for App feature.
 */
import {
    Module
} from "@nestjs/common"
import {
    ConfigModule
} from "@nestjs/config"
import {
    UserModule
} from "./modules"

/** root module with global config and in-memory demo; no database.
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env"],
        }),
        UserModule,
    ],
})
export class AppModule { }
