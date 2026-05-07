/**
 * Custom decorator — response-message.decorator.
 * (EN: Custom decorator — response-message.decorator.)
 */
import {
    SetMetadata 
} from "@nestjs/common"

/**
 * Metadata key Ä‘á»ƒ **TransformInterceptor** Ä‘á»c message tuỳ endpoint (EN: metadata key read by TransformInterceptor for per-route messages).
 */
export const RESPONSE_MESSAGE = "response_message"

/**
 * Gắn message success tuỳ chỉnh lên handler (EN: attach custom success message metadata to a route handler).
 *
 * @param message - Chuỗi hiá»ƒn thị trong envelope `message` (EN: string shown in success envelope `message` field).
 * @returns Factory metadata gắn lên route/class (EN: metadata factory bound to route or class).
 */
export const ResponseMessage = (message: string): ReturnType<typeof SetMetadata> =>
    SetMetadata(RESPONSE_MESSAGE,
        message)
