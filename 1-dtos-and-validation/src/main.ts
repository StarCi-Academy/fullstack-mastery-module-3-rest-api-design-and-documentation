import {
    NestFactory 
} from "@nestjs/core"
import {
    ValidationPipe 
} from "@nestjs/common"
import {
    AppModule 
} from "./app.module"

/**
 * Khởi động HTTP server NestJS, đăng ký ValidationPipe toàn cục và bind cổng (EN: boot NestJS HTTP server, register global ValidationPipe, and bind port).
 *
 * @returns Promise<void> — Hoàn tất khi process đang listen (EN: resolves once the process is listening).
 * @sideEffects Mở socket HTTP; ValidationPipe chặn request không hợp lệ trước khi tới controller (EN: opens HTTP socket; ValidationPipe rejects invalid requests before reaching controllers).
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule)

    // --- Kích hoạt ValidationPipe Toàn cục (Global) ---
    // Giúp bảo vệ server khỏi dữ liệu rác và không hợp lệ.
    // (EN: Activate Global ValidationPipe. Protects server from invalid/garbage data.)
    app.useGlobalPipes(
        new ValidationPipe({
            // Tự động loại bỏ các field không được khai báo trong DTO
            // (EN: Strips malicious extra fields not defined in DTO)
            whitelist: true,

            // Trả về lỗi nếu phát hiện field "lạ" không có trong DTO
            // (EN: Throws error if extra fields are detected)
            forbidNonWhitelisted: true,

            // Tự động chuyển đổi payload sang đúng kiểu dữ liệu TS (string -> number, etc)
            // (EN: Automatically transforms payloads to match correct TypeScript types)
            transform: true,
        }),
    )

    const port = process.env.PORT ?? 3000
    await app.listen(port)
}

void bootstrap()
