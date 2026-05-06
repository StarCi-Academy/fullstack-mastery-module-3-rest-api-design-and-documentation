/**
 * Khởi tạo Nest app — TransformInterceptor + AllExceptionsFilter toàn cục, lắng nghe cổng.
 * (EN: Bootstrap Nest app — global TransformInterceptor + AllExceptionsFilter, listen on port.)
 */
import {
    NestFactory,
    Reflector,
} from "@nestjs/core"
import {
    AppModule,
} from "./app.module"
import {
    AllExceptionsFilter,
} from "./common/filters"
import {
    TransformInterceptor,
} from "./common/interceptors"

export async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule)
    const reflector = app.get(Reflector)
    // Bọc success response thống nhất.
    // (EN: Unified success envelope.)
    app.useGlobalInterceptors(new TransformInterceptor(reflector))
    // Bọc mọi lỗi thành JSON contract.
    // (EN: Unified error JSON for all exceptions.)
    app.useGlobalFilters(new AllExceptionsFilter())

    // Cổng: biến môi trường PORT hoặc 3000.
    // (EN: Port from env PORT or default 3000.)
    const port = Number(process.env.PORT) || 3000
    await app.listen(port, "0.0.0.0")
}
