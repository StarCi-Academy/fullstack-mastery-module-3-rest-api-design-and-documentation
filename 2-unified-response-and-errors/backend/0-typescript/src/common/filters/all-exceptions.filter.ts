/**
 * Exception filter — all-exceptions.filter.
 *
 * This is the "error branch" of the unified output contract.  Every exception
 * that bubbles past controller handlers (known HttpExceptions, unknown Errors,
 * anything) is caught here and normalized into the stable error envelope:
 *   { statusCode, error, message, details?, timestamp, path }
 *
 * No stack traces, no internal details ever reach the client — only structured,
 * safe information that clients can parse with a single code path.
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
 * Global exception filter registered via `useGlobalFilters` in bootstrap.
 * `@Catch()` with no arguments means it catches every thrown value, including
 * plain `Error` objects and unknown values — nothing escapes the contract.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    /**
     * Intercepts any exception at the HTTP boundary and writes the unified error
     * envelope to the response.  Known `HttpException` subclasses preserve their
     * status code and name; anything else is downgraded to HTTP 500 with a generic
     * message to prevent leaking internal details.
     *
     * @param exception - the caught value (HttpException, Error, or unknown).
     * @param host      - the arguments host, used to access the Express req/res pair.
     * @sideEffects     - sets response status and writes JSON body; no return value.
     */
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<{ url: string }>()

        // Determine HTTP status: known HttpException retains its status (400, 404…),
        // anything else (raw Error, unexpected throw) becomes 500.
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR

        // Use the exception class name as the `error` discriminator so clients
        // can branch on type ("NotFoundException", "BadRequestException"…).
        // Unknown exceptions get a safe generic label — no internal class name exposed.
        const error =
            exception instanceof HttpException
                ? exception.constructor.name
                : "Internal Error"

        // Extract the human-readable message; array messages from ValidationPipe
        // are joined into a single string here (the array itself goes to `details`).
        const message = this.resolveMessage(exception)

        // Extract structured details (validation array or NotFound resource info)
        // only when present — the spread below omits the key entirely if undefined.
        const details = this.resolveDetails(exception)

        response.status(status).json({
            statusCode: status,
            error,
            message,
            // Conditional spread: include `details` only when defined so the key
            // is absent rather than `details: undefined` (which some parsers choke on).
            ...(details !== undefined ? { details } : {}),
            timestamp: new Date().toISOString(),  // ISO 8601 for log correlation
            path: request.url,                    // exact request path for tracing
        })
    }

    /**
     * Extracts machine-readable details from an HttpException response payload.
     *
     * - ValidationPipe wraps field errors in an array under `message` → returned as-is.
     * - Custom exceptions may attach arbitrary `details` to the response object.
     * - Returns `undefined` for plain string responses or unknown exceptions
     *   so the caller can conditionally omit the `details` field.
     *
     * @param exception - the caught value.
     * @returns structured details array/object, or `undefined` if not applicable.
     */
    private resolveDetails(exception: unknown): unknown {
        if (exception instanceof HttpException) {
            const res = exception.getResponse()
            // Only inspect object payloads — string payloads have no structured detail.
            if (typeof res === "object" && res !== null) {
                const obj = res as { message?: unknown; details?: unknown }
                // ValidationPipe sets `message` to a string[] of field errors.
                // Returning it as `details` lets clients iterate field errors individually.
                if (Array.isArray(obj.message)) {
                    return obj.message
                }
                // Custom exceptions (e.g. NotFoundException with { resource, id }) attach
                // their payload under `details` explicitly.
                if (obj.details !== undefined) {
                    return obj.details
                }
            }
        }
        // Unknown exception type or plain string response — no structured details.
        return undefined
    }

    /**
     * Produces a safe, client-facing message string from any exception.
     *
     * - HttpException with string response → return as-is.
     * - HttpException with object response and string `message` → return that string.
     * - HttpException with array `message` (ValidationPipe) → join into one string.
     * - Plain Error → use its message (safe for known domain errors).
     * - Unknown → return generic "Internal Server Error" (never expose internals).
     *
     * @param exception - the caught value.
     * @returns a safe, human-readable message string.
     */
    private resolveMessage(exception: unknown): string {
        if (exception instanceof HttpException) {
            const res = exception.getResponse()
            // String payload: already the message.
            if (typeof res === "string") {
                return res
            }
            if (typeof res === "object" && res !== null && "message" in res) {
                const raw = (res as { message: unknown }).message
                if (typeof raw === "string") {
                    return raw   // single string message from HttpException
                }
                if (Array.isArray(raw)) {
                    // Validation produces multiple messages; join for the `message` field
                    // while the array itself is preserved under `details`.
                    return raw.join(", ")
                }
            }
        }
        if (exception instanceof Error) {
            // Known domain Error with a meaningful message (not an internal exception).
            return exception.message
        }
        // Truly unknown value — never risk leaking internals via toString().
        return "Internal Server Error"
    }
}
