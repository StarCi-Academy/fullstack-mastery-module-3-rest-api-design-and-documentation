/**
 * Interceptor — transform.interceptor.
 * (EN: Interceptor — transform.interceptor.)
 */
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from "@nestjs/common"
import {
    Reflector 
} from "@nestjs/core"
import type {
    Observable 
} from "rxjs"
import {
    map 
} from "rxjs/operators"
import {
    RESPONSE_MESSAGE 
} from "../decorators"

/**
 * Bá»c má»i response thành công vào envelope `{ statusCode, message, data, timestamp }` (EN: wraps successful responses in a stable JSON envelope).
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T,
unknown> {
    constructor(private readonly reflector: Reflector) {}

    /**
     * Äá»c HTTP status + `@ResponseMessage()` rồi map body sang envelope (EN: reads HTTP status and `@ResponseMessage()` then maps body to envelope).
     *
     * @param context - Ngữ cảnh thực thi Nest (handler/class) (EN: Nest execution context).
     * @param next - Call chain tới controller (EN: downstream call handler).
     * @returns Observable envelope JSON (EN: observable of envelope JSON).
     */
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        const statusCode = context.switchToHttp().getResponse().statusCode
        const message =
            this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE,
                [
                    context.getHandler(),
                    context.getClass(),
                ]) ?? "Success"

        return next.handle().pipe(
            map((data) => ({
                statusCode,
                message,
                data: data ?? null,
                timestamp: new Date().toISOString(),
            })),
        )
    }
}
