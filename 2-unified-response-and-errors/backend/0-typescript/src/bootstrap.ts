/** Bootstrap Nest app — global TransformInterceptor + AllExceptionsFilter, listen on port.
 */
import {
    ValidationPipe,
} from "@nestjs/common"
import {
    NestFactory,
    Reflector,
} from "@nestjs/core"
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
    // Enable ValidationPipe — produces BadRequestException with message array for the filter to normalize.
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )
    // Unified success envelope.
    app.useGlobalInterceptors(new TransformInterceptor(reflector))
    // Unified error JSON for all exceptions.
    app.useGlobalFilters(new AllExceptionsFilter())

    // Port from env PORT or default 3000.
    const port = Number(process.env.PORT) || 3000
    await app.listen(port,
        "0.0.0.0")
}
