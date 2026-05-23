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
    CatModule,
    DogModule
} from "./modules"

/**
 * Root module — Config global + demo cats + không database (EN: root module with global config and in-memory cats; no database).
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env"],
        }),
        CatModule,
        DogModule,
    ],
})
export class AppModule {}
