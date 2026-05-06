/**
 * Controller REST cho feature Cat.
 * (EN: REST controller for Cat feature.)
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
} from "./dto/create-cat.dto"

/**
 * HTTP `/cats` + decorator **OpenAPI** â€” khá»›p vÃ­ dá»¥ giÃ¡o trÃ¬nh (EN: `/cats` HTTP surface with OpenAPI decorators per lesson).
 */
@ApiTags("Cats Module")
@Controller("cats")
export class CatController {
    constructor(private readonly catService: CatService) {}

    /**
     * `GET /cats` â€” envelope success + docs (EN: success envelope + Swagger operation metadata).
     *
     * @returns Danh sÃ¡ch mÃ¨o (EN: list of cats).
     */
    @Get()
    @ApiOperation({
        summary: "Retrieve all cats",
    })
    @ApiResponse({
        status: 200,
        description: "List of cats returned",
    })
    @ResponseMessage("Láº¥y danh sÃ¡ch mÃ¨o thÃ nh cÃ´ng (EN: Get all cats success)")
    findAll(): CatRecord[] {
        return this.catService.findAll()
    }

    /**
     * `POST /cats` â€” táº¡o mÃ¨o tá»« DTO (EN: creates a cat from validated DTO).
     *
     * @param dto - Body JSON theo `CreateCatDto` (EN: request body matching `CreateCatDto`).
     * @returns Báº£n ghi má»›i (EN: newly created record).
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
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

    /**
     * `GET /cats/error-demo` â€” luá»“ng lá»—i cá»‘ Ä‘á»‹nh cho **AllExceptionsFilter** (EN: fixed error path for unified error envelope).
     *
     * @returns KhÃ´ng (luÃ´n nÃ©m exception) (EN: never returns successfully).
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
