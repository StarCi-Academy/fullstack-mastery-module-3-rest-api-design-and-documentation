import {
    NestFactory 
} from "@nestjs/core"
import {
    AppModule 
} from "./app.module"

/**
 * Khởi động HTTP server NestJS và bind cổng (EN: boot NestJS HTTP server and bind port).
 *
 * @returns Promise<void> — Hoàn tất khi process đang listen (EN: resolves once the process is listening).
 * @sideEffects Mở socket HTTP; CRUD user ghi PostgreSQL qua TypeORM khi có request (EN: opens HTTP socket; user CRUD writes PostgreSQL via TypeORM when handling requests).
 */
async function bootstrap(): Promise<void> {
    // Tạo application context từ root module (EN: create application context from root module).
    const app = await NestFactory.create(AppModule)
    // Ưu tiên PORT từ môi trường để deploy linh hoạt (EN: prefer PORT from env for flexible deployment).
    const port = process.env.PORT ?? 3000
    await app.listen(port)
}

void bootstrap()
