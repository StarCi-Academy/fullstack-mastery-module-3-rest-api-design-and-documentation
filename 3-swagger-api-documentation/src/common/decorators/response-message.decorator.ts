/**
 * Custom decorator — response-message.decorator.
 * (EN: Custom decorator — response-message.decorator.)
 */
import {
    SetMetadata 
} from "@nestjs/common"

/**
 * Metadata key Ä‘á»ƒ **TransformInterceptor** Ä‘á»c message tuá»³ endpoint (EN: metadata key read by TransformInterceptor for per-route messages).
 */
export const RESPONSE_MESSAGE = "response_message"

/**
 * Gáº¯n message success tuá»³ chá»‰nh lÃªn handler (EN: attach custom success message metadata to a route handler).
 *
 * @param message - Chuá»—i hiá»ƒn thá»‹ trong envelope `message` (EN: string shown in success envelope `message` field).
 * @returns Factory metadata gáº¯n lÃªn route/class (EN: metadata factory bound to route or class).
 */
export const ResponseMessage = (message: string): ReturnType<typeof SetMetadata> =>
    SetMetadata(RESPONSE_MESSAGE,
        message)
