/**
 * Khởi tạo Nest app — ValidationPipe + envelope + Swagger + Scalar, lắng nghe cổng.
 * (EN: Bootstrap Nest app — ValidationPipe + envelope + Swagger + Scalar, listen on port.)
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

    // DocumentBuilder cấu hình metadata + nhóm tag + bearer auth scheme
    // (EN: DocumentBuilder configures metadata, route grouping tags, and the bearer auth scheme).
    const openApiConfig = new DocumentBuilder()
        .setTitle("StarCi Academy Backend")
        .setDescription("API documentation for the REST API Design & Documentation lesson")
        .setVersion("1.0")
        .addTag("Cats Module", "Mèo demo (EN: demo cats)")
        .addTag("Dogs Module", "Chó demo (EN: demo dogs)")
        .addBearerAuth()
        .build()

    const document = SwaggerModule.createDocument(app,
        openApiConfig)

    app.use(
        "/scalar",
        apiReference({
            content: document 
        }),
    )

    SwaggerModule.setup("swagger",
        app,
        document)

    // Cổng: biến môi trường PORT hoặc 3000.
    // (EN: Port from env PORT or default 3000.)
    const port = Number(process.env.PORT) || 3000
    await app.listen(port,
        "0.0.0.0")
}
