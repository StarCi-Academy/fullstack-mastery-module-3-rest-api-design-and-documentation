import {
    ValidationPipe 
} from "@nestjs/common"
import {
    NestFactory, Reflector 
} from "@nestjs/core"
import {
    DocumentBuilder, SwaggerModule 
} from "@nestjs/swagger"
import {
    apiReference 
} from "@scalar/nestjs-api-reference"
import {
    AppModule 
} from "./app.module"
import {
    AllExceptionsFilter 
} from "./common/filters"
import {
    TransformInterceptor 
} from "./common/interceptors"

/**
 * Khởi động Nest: **ValidationPipe** global, envelope success/error, sinh **OpenAPI**, mount **Swagger UI** (`/swagger`) + **Scalar** (`/scalar`) (EN: boots Nest with global validation, unified envelopes, OpenAPI document, Swagger UI and Scalar).
 *
 * @returns Promise<void> — Listen khi HTTP server sẵn sàng (EN: resolves once the HTTP server is listening).
 * @sideEffects Đăng ký middleware docs + mở cổng `PORT` (EN: registers docs middleware and binds `PORT`).
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule)
    const reflector = app.get(Reflector)

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )
    app.useGlobalInterceptors(new TransformInterceptor(reflector))
    app.useGlobalFilters(new AllExceptionsFilter())

    const openApiConfig = new DocumentBuilder()
        .setTitle("StarCi Academy Backend")
        .setDescription("API documentation")
        .setVersion("1.0")
        .addBearerAuth()
        .build()

    const document = SwaggerModule.createDocument(app,
        openApiConfig)

    app.use(
        "/scalar",
        apiReference({
            content: document,
        }),
    )

    SwaggerModule.setup("swagger",
        app,
        document)

    const port = process.env.PORT ?? 3000
    await app.listen(port)
}

void bootstrap()
