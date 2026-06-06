package academy.starci.swagger;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * REST controller for the /cats resource, demonstrating:
 * <ul>
 *   <li>OpenAPI annotations ({@code @Tag}, {@code @Operation}, {@code @ApiResponse})</li>
 *   <li>Manual request body validation to mirror the DTO-based approach from other langs</li>
 *   <li>Unified JSON envelope for both success and error responses</li>
 * </ul>
 */
@RestController
@RequestMapping("/cats")
@Tag(name = "Cats Module")
public class CatController {

    /** In-memory store seeded with one sample record; CopyOnWriteArrayList is thread-safe. */
    private final List<CatRecord> cats = new CopyOnWriteArrayList<>(List.of(new CatRecord("Milo", 3)));

    /**
     * Returns all cats wrapped in the unified success envelope.
     *
     * @return 200 response with {@code {statusCode, message, data, timestamp}} envelope.
     */
    @GetMapping
    @Operation(summary = "Retrieve all cats")
    @ApiResponse(responseCode = "200", description = "List of cats returned")
    public ResponseEntity<Map<String, Object>> findAll() {
        // LinkedHashMap preserves insertion order so envelope fields appear in a predictable sequence.
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("statusCode", 200);
        body.put("message", "Lấy danh sách mèo thành công (EN: Get all cats success)");
        body.put("data", cats);
        body.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(body);
    }

    /**
     * Creates a new cat from the raw JSON payload after manual type validation.
     * Manual validation is used here (instead of a typed DTO) to keep the Java impl
     * portable with the Go/TypeScript pattern for this lesson.
     *
     * @param payload raw JSON body — expected fields: {@code breed} (String), {@code age} (Number).
     * @return 201 with the created record, or 400 if validation fails.
     */
    @PostMapping
    @Operation(summary = "Create a new cat")
    @ApiResponse(responseCode = "201", description = "Cat created")
    @ApiResponse(responseCode = "400", description = "Invalid payload")
    @SecurityRequirement(name = "bearer")   // marks this operation as requiring bearer auth in the spec
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> payload) {
        List<String> messages = new ArrayList<>();

        // Validate breed: must be a non-null String.
        Object breedObj = payload.get("breed");
        if (!(breedObj instanceof String)) {
            messages.add("breed must be a string");
        }

        // Validate age: JSON numbers deserialise as Number (Integer or Long depending on value).
        Object ageObj = payload.get("age");
        if (!(ageObj instanceof Number)) {
            messages.add("age must be a number conforming to the specified constraints");
        }

        // Collect all validation errors before throwing, mirroring class-validator behaviour.
        if (!messages.isEmpty()) {
            throw new BadRequestException(String.join(", ", messages));
        }

        // Safe casts: guarded above.
        String breed = (String) breedObj;
        int age = ((Number) ageObj).intValue();

        CatRecord newCat = new CatRecord(breed, age);
        cats.add(newCat);   // append to in-memory store

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("statusCode", 201);
        body.put("message", "Success");
        body.put("data", newCat);
        body.put("timestamp", java.time.Instant.now().toString());

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /**
     * Demo endpoint that always throws a {@code BadRequestException} so students can
     * observe the unified error envelope returned by {@link CatExceptionHandler}.
     */
    @GetMapping("/error-demo")
    @Operation(summary = "Demo error response (Bad Request)")
    @ApiResponse(responseCode = "400", description = "Simulated bad request for unified error contract")
    public void errorDemo() {
        throw new BadRequestException("Simulated error for Unified Error Response demo");
    }

    /**
     * Lightweight domain exception used only within this controller.
     * Extends {@link RuntimeException} so Spring does not require a checked-exception handler.
     */
    public static class BadRequestException extends RuntimeException {
        /**
         * @param message client-facing error message.
         */
        public BadRequestException(String message) {
            super(message);
        }
    }

    /**
     * Controller-advice that catches {@link BadRequestException} thrown anywhere in the app
     * and maps it to the unified error envelope with HTTP 400.
     */
    @RestControllerAdvice
    public static class CatExceptionHandler {

        /**
         * Converts a {@link BadRequestException} to the lesson's unified error JSON envelope.
         *
         * @param ex      the caught exception.
         * @param request the incoming HTTP request (used to capture the request path).
         * @return 400 response with {@code {statusCode, error, message, timestamp, path}}.
         */
        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
            // LinkedHashMap so fields appear in the same order across all language implementations.
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("statusCode", 400);
            body.put("error", "BadRequestException");   // class name mirrors NestJS convention
            body.put("message", ex.getMessage());
            body.put("timestamp", java.time.Instant.now().toString());
            body.put("path", request.getRequestURI());  // helps clients correlate with server logs
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }
    }
}
