/** Bootstrap Nest app — ValidationPipe + envelope + Swagger + Scalar, listen on port.
 */
import {
    ValidationPipe,
} from "@nestjs/common"
import {
    NestFactory,
    Reflector,
} from "@nestjs/core"
import {
    DocumentBuilder,
    SwaggerModule,
} from "@nestjs/swagger"
import {
    apiReference,
} from "@scalar/nestjs-api-reference"
import {
    AppModule,
} from "./app.module"
import {
    AllExceptionsFilter,
    TransformInterceptor,
} from "./common"

export async function bootstrap(): Promise<void> {
    // Create the NestJS application instance from the root AppModule.
    const app = await NestFactory.create(AppModule)
    // Reflector reads metadata set by decorators (e.g. @ResponseMessage) at runtime.
    const reflector = app.get(Reflector)

    // whitelist strips unknown fields; forbidNonWhitelisted rejects them with 400;
    // transform coerces primitives to their declared DTO types (string → number).
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )
    // Wrap every success response in {statusCode, message, data, timestamp} envelope.
    app.useGlobalInterceptors(new TransformInterceptor(reflector))
    // Convert any thrown exception to a unified JSON error envelope (no stack traces).
    app.useGlobalFilters(new AllExceptionsFilter())

    // DocumentBuilder is the fluent API for the OpenAPI info object.
    // addBearerAuth() adds the `bearer` security scheme to the spec's securitySchemes.
    const openApiConfig = new DocumentBuilder()
        .setTitle("StarCi Academy Backend")
        .setDescription("API documentation for the REST API Design & Documentation lesson")
        .setVersion("1.0")
        .addBearerAuth()
        .build()

    // createDocument scans all controllers for @ApiTags/@ApiOperation/@ApiResponse
    // and produces the full OpenAPI JSON document in memory.
    const document = SwaggerModule.createDocument(app,
        openApiConfig)

    // Mount Scalar (alternative API explorer UI) at /scalar.
    app.use(
        "/scalar",
        apiReference({
            content: document
        }),
    )

    // Mount the standard Swagger UI at /swagger and expose the JSON spec at /swagger-json.
    SwaggerModule.setup("swagger",
        app,
        document)

    // Port from env PORT or default 3000.
    const port = Number(process.env.PORT) || 3000
    await app.listen(port,
        "0.0.0.0")
}
