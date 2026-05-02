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
 * Root module — Config global + demo cats + không database (EN: root module with global config and in-memory cats; no database).
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
