/**
 * REST controller for Cat feature.
 */
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
} from "@nestjs/common"
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger"
import {
    ResponseMessage 
} from "../../common/decorators"
import {
    CatService 
} from "./cat.service"
import type {
    CatRecord 
} from "./cat.service"
import {
    CreateCatDto
} from "./dto"

/** `/cats` HTTP surface with OpenAPI decorators per lesson.
 */
@ApiTags("Cats Module")
@Controller("cats")
export class CatController {
    constructor(private readonly catService: CatService) {}

    /**
     * `GET /cats` — success envelope + Swagger operation metadata.
     * list of cats.
     */
    @Get()
    @ApiOperation({
        summary: "Retrieve all cats",
    })
    @ApiResponse({
        status: 200,
        description: "List of cats returned",
    })
Get all cats success)"
    findAll(): CatRecord[] {
        return this.catService.findAll()
    }

    /** creates a cat from validated DTO.
     *
     * @param dto - request body matching `CreateCatDto`.
     * newly created record.
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Create a new cat",
    })
    @ApiResponse({
        status: 201,
        description: "Cat created",
    })
    @ApiResponse({
        status: 400,
        description: "Invalid payload",
    })
    create(@Body() dto: CreateCatDto): CatRecord {
        return this.catService.create(dto)
    }

    /** fixed error path for unified error envelope.
     * never returns successfully.
     */
    @Get("error-demo")
    @ApiOperation({
        summary: "Demo error response (Bad Request)",
    })
    @ApiResponse({
        status: 400,
        description: "Simulated bad request for unified error contract",
    })
    errorDemo(): void {
        this.catService.triggerDemoError()
    }
}
