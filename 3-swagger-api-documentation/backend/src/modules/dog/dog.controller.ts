/**
 * Controller REST cho feature Dog.
 * (EN: REST controller for Dog feature.)
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

/**
 * HTTP `/dogs` — minh hoạ tag thứ hai trên Swagger để demo nhóm route
 * (EN: `/dogs` surface for a second Swagger tag demonstrating route grouping).
 */
@ApiTags("Dogs Module")
@Controller("dogs")
export class DogController {
    constructor(private readonly dogService: DogService) {}

    /**
     * `GET /dogs` — trả danh sách chó demo (EN: returns list of demo dogs).
     *
     * @returns Mảng `DogRecord` (EN: array of dog records).
     */
    @Get()
    @ApiOperation({
        summary: "Retrieve all dogs",
    })
    @ApiResponse({
        status: 200,
        description: "List of dogs returned",
    })
    @ResponseMessage("Lấy danh sách chó thành công (EN: Get all dogs success)")
    findAll(): DogRecord[] {
        return this.dogService.findAll()
    }
}
