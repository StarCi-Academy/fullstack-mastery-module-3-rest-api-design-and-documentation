import {
    NestFactory, Reflector 
} from "@nestjs/core"
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
 * Khởi động Nest, đăng ký **TransformInterceptor** + **AllExceptionsFilter** toàn cục (EN: boots Nest with global response transform and exception filter).
 *
 * @returns Promise<void> — Listen xong khi resolve (EN: resolves once HTTP server is listening).
 * @sideEffects Mở cổng `PORT` (mặc định 3000) (EN: binds `PORT`, default 3000).
 */
async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule)
    const reflector = app.get(Reflector)
    // Bọc success response thống nhất (EN: unified success envelope).
    app.useGlobalInterceptors(new TransformInterceptor(reflector))
    // Bọc mọi lỗi thành JSON contract (EN: unified error JSON for all exceptions).
    app.useGlobalFilters(new AllExceptionsFilter())

    const port = process.env.PORT ?? 3000
    await app.listen(port)
}

void bootstrap()
