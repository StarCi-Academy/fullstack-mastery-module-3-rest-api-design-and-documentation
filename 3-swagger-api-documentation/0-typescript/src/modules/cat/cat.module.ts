/**
 * CatModule — registers components for Cat feature.
 */
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
 * Cat module wiring in-memory demo.
 */
@Module({
    controllers: [CatController],
    providers: [CatService],
})
export class CatModule {}
