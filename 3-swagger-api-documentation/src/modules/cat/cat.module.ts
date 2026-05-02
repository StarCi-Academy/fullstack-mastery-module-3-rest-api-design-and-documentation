import {
    Module 
} from "@nestjs/common"
import {
    CatController 
} from "./cat.controller"
import {
    CatService 
} from "./cat.service"

/**
 * Module cats — controller + service in-memory cho `/cats` (EN: cat module wiring in-memory demo).
 */
@Module({
    controllers: [CatController],
    providers: [CatService],
})
export class CatModule {}
