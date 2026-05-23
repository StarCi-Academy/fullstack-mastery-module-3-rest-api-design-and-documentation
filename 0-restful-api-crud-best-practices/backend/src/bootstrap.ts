/**
 * Khởi tạo Nest app — lắng nghe cổng.
 * (EN: Bootstrap Nest app — listen on port.)
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
    // Tạo application context từ root module.
    // (EN: Create application context from root module.)
    const app = await NestFactory.create(AppModule)
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidUnknownValues: false,
    }))
    // Cổng: biến môi trường PORT hoặc 3000.
    // (EN: Port from env PORT or default 3000.)
    const port = Number(process.env.PORT) || 3000
    await app.listen(port,
        "0.0.0.0")
}
