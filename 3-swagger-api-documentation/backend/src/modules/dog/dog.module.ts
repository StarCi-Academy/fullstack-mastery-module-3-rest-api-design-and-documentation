/**
 * DogModule — dang ky cac thanh phan cua feature Dog.
 * (EN: DogModule — registers components for Dog feature.)
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
 * Module dogs — controller + service in-memory cho `/dogs` (EN: dog module wiring in-memory demo).
 */
@Module({
    controllers: [DogController],
    providers: [DogService],
})
export class DogModule {}
