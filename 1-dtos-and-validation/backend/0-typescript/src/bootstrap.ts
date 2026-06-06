/**
 * Application bootstrap — configures the global ValidationPipe and starts listening.
 *
 * Registering ValidationPipe here (not per-controller) means every route is protected
 * at the boundary before any controller or service runs.
 */
import {
    NestFactory,
} from "@nestjs/core"
import {
    ValidationPipe,
} from "@nestjs/common"
import {
    AppModule,
} from "./app.module"

/**
 * Bootstrap the NestJS HTTP server with a global ValidationPipe.
 *
 * @returns Promise<void> — resolves once the process is listening on the assigned port.
 * @sideEffects Opens an HTTP socket; ValidationPipe rejects invalid requests before reaching controllers.
 */
export async function bootstrap(): Promise<void> {
    // Create the NestJS application from the root AppModule.
    const app = await NestFactory.create(AppModule)

    // Register the ValidationPipe globally so it runs for every incoming request.
    // This is the core of boundary validation — no controller needs to repeat the logic.
    app.useGlobalPipes(
        new ValidationPipe({
            // whitelist: true — strips any property not declared in the DTO class.
            // This is the primary mass-assignment defence: unknown fields never reach business logic.
            whitelist: true,
            // forbidNonWhitelisted: true — returns a 400 error when extra fields are detected
            // instead of silently discarding them, giving the caller explicit feedback.
            forbidNonWhitelisted: true,
            // transform: true — converts plain JSON objects to DTO class instances
            // and coerces primitive types (e.g. query-string "1" → number 1).
            transform: true,
        }),
    )

    // Read port from environment so the server can be remapped without code changes.
    const port = Number(process.env.PORT) || 3000
    // Bind to all interfaces so the server is reachable from outside the container.
    await app.listen(port, "0.0.0.0")
}
