/**
 * Custom decorator — response-message.decorator.
 */
import {
    SetMetadata 
} from "@nestjs/common"

/** metadata key read by TransformInterceptor for per-route messages.
 */
export const RESPONSE_MESSAGE = "response_message"

/** attach custom success message metadata to a route handler.
 * string shown in success envelope `message` field.
 * metadata factory bound to route or class.
 */
export const ResponseMessage = (message: string): ReturnType<typeof SetMetadata> =>
    SetMetadata(RESPONSE_MESSAGE,
        message)
