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
    UserModule 
} from "./modules/user"

/**
 * Root module â€” Config global + demo user module, khÃ´ng database (EN: root module with global config and in-memory demo; no database).
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
export class AppModule {}
