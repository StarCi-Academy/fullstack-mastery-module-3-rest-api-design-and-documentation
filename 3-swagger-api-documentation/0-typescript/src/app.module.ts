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
    CatModule,
    DogModule
} from "./modules"

/** root module with global config and in-memory cats; no database.
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
