/**
 * Bootstrap — configures and starts the NestJS application.
 *
 * Registers the three global cross-cutting concerns that implement the unified
 * output contract for this lesson:
 *   1. `ValidationPipe`       — turns class-validator errors into 400 BadRequestException.
 *   2. `TransformInterceptor` — wraps every successful response in the success envelope.
 *   3. `AllExceptionsFilter`  — converts every exception into the error envelope.
 *
 * Registering them here (global scope) means no individual controller or module
 * needs to opt-in — every route in the app automatically speaks the same contract.
 */
import {
    ValidationPipe,
} from "@nestjs/common"
import {
    NestFactory,
    Reflector,
} from "@nestjs/core"
import {
    AppModule,
} from "./app.module"
import {
    AllExceptionsFilter,
    TransformInterceptor,
} from "./common"

/**
 * Creates, configures, and starts the NestJS HTTP server.
 *
 * @returns a Promise that resolves once the server is listening.
 * @sideEffects starts an HTTP server on the configured port.
 */
export async function bootstrap(): Promise<void> {
    // Create the Nest application from the root AppModule.
    const app = await NestFactory.create(AppModule)

    // Retrieve the DI-provided Reflector so TransformInterceptor can read
    // @ResponseMessage metadata from route handlers.
    const reflector = app.get(Reflector)

    // Global validation pipe: strip unknown fields (whitelist), reject requests
    // with extra properties (forbidNonWhitelisted), and auto-transform primitive
    // types from JSON strings (transform).  When validation fails it throws a
    // BadRequestException whose `message` is a string[] of field errors — the
    // AllExceptionsFilter then promotes that array to the `details` envelope field.
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,             // remove unrecognised properties silently
            forbidNonWhitelisted: true,  // reject requests that include unknown properties
            transform: true,             // coerce JSON strings to TS types declared in DTOs
        }),
    )

    // Success branch of the unified contract: wraps every non-exception return
    // value in { statusCode, message, data, timestamp }.
    app.useGlobalInterceptors(new TransformInterceptor(reflector))

    // Error branch of the unified contract: catches every exception (HttpException
    // and unknown) and serializes it as { statusCode, error, message, details?, timestamp, path }.
    // Registered AFTER the interceptor so Nest's filter chain runs in the correct order.
    app.useGlobalFilters(new AllExceptionsFilter())

    // Read port from the PORT environment variable (set in .env); default to 3000.
    // Using a numeric coercion is safe here because bootstrap is the only place
    // that reads process.env directly (all business code goes through env config).
    const port = Number(process.env.PORT) || 3000
    await app.listen(port, "0.0.0.0")
}
