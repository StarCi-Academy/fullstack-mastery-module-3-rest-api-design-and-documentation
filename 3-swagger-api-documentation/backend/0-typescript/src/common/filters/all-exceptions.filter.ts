/**
 * Exception filter — all-exceptions.filter.
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

/** catches all exceptions and returns a unified JSON error without stack traces.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    /** normalizes any exception to the unified error contract.
     * any thrown value.
     * host for HTTP req/res.
     * @sideEffects writes HTTP status and JSON body.
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

    /** safely extracts message from Nest HttpException payloads.
     * thrown value.
     * client-facing message string.
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
