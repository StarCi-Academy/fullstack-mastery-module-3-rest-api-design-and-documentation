/**
 * Interceptor — transform.interceptor.
 *
 * Wraps every successful controller return value in a stable JSON envelope so
 * clients always parse the same shape: { statusCode, message, data, timestamp }.
 * This is the "success branch" of the unified output contract — the companion
 * AllExceptionsFilter handles the "error branch".
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
 * Global interceptor that wraps every successful response in the unified
 * success envelope.  Registered once in bootstrap via `useGlobalInterceptors`
 * so no individual controller needs to build the envelope itself.
 *
 * @template T - the raw return type of the controller handler.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
    /**
     * @param reflector - NestJS Reflector used to read `@ResponseMessage` metadata
     *   from the handler or class, enabling per-route custom messages without
     *   modifying the controller's return value.
     */
    constructor(private readonly reflector: Reflector) {}

    /**
     * Intercepts the response after the handler returns.  Reads the HTTP status
     * that Nest already assigned to the response object, reads the custom message
     * from `@ResponseMessage` metadata (fallback: `"Success"`), then wraps the
     * handler's return value into the success envelope via RxJS `map`.
     *
     * @param context - the execution context giving access to the HTTP request/response.
     * @param next    - the call handler; calling `next.handle()` invokes the route handler.
     * @returns an Observable that emits the wrapped envelope instead of the raw body.
     */
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        // Read the HTTP status code Nest assigned (e.g. 200 for GET, 201 for POST @HttpCode).
        // We read it BEFORE calling the handler so the status is captured at intercept time.
        const statusCode = context.switchToHttp().getResponse().statusCode

        // Check both the handler-level and class-level metadata for a custom message.
        // getAllAndOverride returns the first defined value in the list, handler wins over class.
        // Falls back to "Success" when no @ResponseMessage decorator is present.
        const message =
            this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE,
                [
                    context.getHandler(),  // method-level decorator takes precedence
                    context.getClass(),    // class-level decorator is the fallback
                ]) ?? "Success"

        return next.handle().pipe(
            // `map` transforms the handler's return value without changing behaviour —
            // the original data is preserved under the `data` key; null guards against
            // void handlers that return undefined.
            map((data) => ({
                statusCode,
                message,
                data: data ?? null,          // null instead of undefined for valid JSON
                timestamp: new Date().toISOString(),  // ISO 8601 for easy log correlation
            })),
        )
    }
}
