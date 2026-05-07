/**
 * Khởi tạo Nest app — ValidationPipe toàn cục, lắng nghe cổng.
 * (EN: Bootstrap Nest app — global ValidationPipe, listen on port.)
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

    // Kích hoạt ValidationPipe toàn cục — bảo vệ server khỏi dữ liệu rác.
    // (EN: Activate Global ValidationPipe — protects server from invalid/garbage data.)
    app.useGlobalPipes(
        new ValidationPipe({
            // Tự động loại bỏ các field không được khai báo trong DTO.
            // (EN: Strips extra fields not defined in DTO.)
            whitelist: true,
            // Trả về lỗi nếu phát hiện field lạ không có trong DTO.
            // (EN: Throws error if extra fields are detected.)
            forbidNonWhitelisted: true,
            // Tự động chuyển đổi payload sang đúng kiểu dữ liệu TS.
            // (EN: Automatically transforms payloads to match correct TypeScript types.)
            transform: true,
        }),
    )

    // Cổng: biến môi trường PORT hoặc 3000.
    // (EN: Port from env PORT or default 3000.)
    const port = Number(process.env.PORT) || 3000
    await app.listen(port,
        "0.0.0.0")
}
