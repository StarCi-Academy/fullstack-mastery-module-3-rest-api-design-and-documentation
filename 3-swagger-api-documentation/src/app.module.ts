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
    CatModule 
} from "./modules/cat"

/**
 * Root module â€” Config global + demo cats + khÃ´ng database (EN: root module with global config and in-memory cats; no database).
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env"],
        }),
        CatModule,
    ],
})
export class AppModule {}
