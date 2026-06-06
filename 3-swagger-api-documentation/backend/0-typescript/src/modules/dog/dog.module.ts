/**
 * DogModule — registers components for Dog feature.
 */
import {
    Module
} from "@nestjs/common"
import {
    DogController
} from "./dog.controller"
import {
    DogService
} from "./dog.service"

/**
 * Dog module wiring in-memory demo.
 */
@Module({
    controllers: [DogController],
    providers: [DogService],
})
export class DogModule {}
