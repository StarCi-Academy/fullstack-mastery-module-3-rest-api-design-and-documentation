/** Bootstrap Nest app — global ValidationPipe, listen on port.
 */
import {
    NestFactory,
} from "@nestjs/core"
import {
    ValidationPipe,
} from "@nestjs/common"
import {
    AppModule,
} from "./app.module"

export async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule)

    // Activate Global ValidationPipe — protects server from invalid/garbage data.
    app.useGlobalPipes(
        new ValidationPipe({
            // Strips extra fields not defined in DTO.
            whitelist: true,
            // Throws error if extra fields are detected.
            forbidNonWhitelisted: true,
            // Automatically transforms payloads to match correct TypeScript types.
            transform: true,
        }),
    )

    // Port from env PORT or default 3000.
    const port = Number(process.env.PORT) || 3000
    await app.listen(port,
        "0.0.0.0")
}
