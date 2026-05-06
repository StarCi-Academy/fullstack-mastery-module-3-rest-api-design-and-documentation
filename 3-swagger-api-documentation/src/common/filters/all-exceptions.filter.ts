/**
 * Exception filter — all-exceptions.filter.
 * (EN: Exception filter — all-exceptions.filter.)
 */
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from "@nestjs/common"
import type {
    Response 
} from "express"

/**
 * Báº¯t má»i exception vÃ  tráº£ JSON lá»—i thá»‘ng nháº¥t, khÃ´ng lá»™ stack trace (EN: catches all exceptions and returns a unified JSON error without stack traces).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    /**
     * Chuáº©n hoÃ¡ exception thÃ nh `{ statusCode, error, message, timestamp, path }` (EN: normalizes any exception to the unified error contract).
     *
     * @param exception - Lá»—i báº¥t ká»³ (HttpException hoáº·c unknown) (EN: any thrown value).
     * @param host - Arguments host Ä‘á»ƒ láº¥y HTTP req/res (EN: host for HTTP req/res).
     * @sideEffects Ghi HTTP status + JSON body ra response (EN: writes HTTP status and JSON body).
     */
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<{ url: string }>()

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR

        const error =
            exception instanceof HttpException
                ? exception.constructor.name
                : "Internal Error"

        const message = this.resolveMessage(exception)

        response.status(status).json({
            statusCode: status,
            error,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        })
    }

    /**
     * TrÃ­ch message an toÃ n tá»« HttpException.getResponse() hoáº·c Error (EN: safely extracts message from Nest HttpException payloads).
     *
     * @param exception - GiÃ¡ trá»‹ Ä‘Æ°á»£c nÃ©m (EN: thrown value).
     * @returns Chuá»—i message cho client (EN: client-facing message string).
     */
    private resolveMessage(exception: unknown): string {
        if (exception instanceof HttpException) {
            const res = exception.getResponse()
            if (typeof res === "string") {
                return res
            }
            if (typeof res === "object" && res !== null && "message" in res) {
                const raw = (res as { message: unknown }).message
                if (typeof raw === "string") {
                    return raw
                }
                if (Array.isArray(raw)) {
                    return raw.join(", ")
                }
            }
        }
        if (exception instanceof Error) {
            return exception.message
        }
        return "Internal Server Error"
    }
}
