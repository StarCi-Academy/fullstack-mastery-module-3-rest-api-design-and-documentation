/**
 * REST controller for Dog feature.
 */
import {
    Controller, Get
} from "@nestjs/common"
import {
    ApiOperation, ApiResponse, ApiTags
} from "@nestjs/swagger"
import {
    ResponseMessage
} from "../../common/decorators"
import {
    DogService
} from "./dog.service"
import type {
    DogRecord
} from "./dog.service"

/** `/dogs` surface for a second Swagger tag demonstrating route grouping.
 */
@ApiTags("Dogs Module")
@Controller("dogs")
export class DogController {
    constructor(private readonly dogService: DogService) {}

    /** returns list of demo dogs.
     * array of dog records.
     */
    @Get()
    @ApiOperation({
        summary: "Retrieve all dogs",
    })
    @ApiResponse({
        status: 200,
        description: "List of dogs returned",
    })
Get all dogs success)"
    findAll(): DogRecord[] {
        return this.dogService.findAll()
    }
}
