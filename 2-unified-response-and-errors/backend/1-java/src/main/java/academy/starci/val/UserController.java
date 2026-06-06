package academy.starci.val;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * REST controller exposing the {@code /users} resource.
 *
 * <p>Demonstrates the unified output contract for this lesson:
 * <ul>
 *   <li>Success responses are built inline as {@code LinkedHashMap} (preserving field order)
 *       and wrapped in a {@code ResponseEntity} with the correct HTTP status.</li>
 *   <li>Error responses are delegated to the {@link GlobalExceptionHandler} (inner class below)
 *       which normalizes every exception into the same error envelope shape.</li>
 * </ul>
 *
 * <p>Note: in a production codebase the success envelope would be extracted into a
 * {@code ResponseBodyAdvice} so controllers return domain objects directly.
 * This flat approach is intentional here to make the envelope construction visible.</p>
 */
@RestController
@RequestMapping("/users")
public class UserController {

    /**
     * Thread-safe in-memory user store. Pre-seeded with one demo user.
     * {@code CopyOnWriteArrayList} avoids {@code ConcurrentModificationException}
     * when reads and writes happen on different threads (e.g. parallel requests).
     */
    private final List<User> users = new CopyOnWriteArrayList<>(List.of(new User(1, "John Doe")));

    /** Monotonic counter for assigning new user IDs; starts at 2 (1 is already taken). */
    private int nextId = 2;

    /**
     * GET /users — returns all users in the success envelope.
     *
     * @return HTTP 200 with {@code { statusCode, message, data, timestamp }}.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> findAll() {
        // Build the success envelope as a LinkedHashMap to preserve insertion order
        // so the JSON keys appear in the documented sequence (statusCode, message, data, timestamp).
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("statusCode", 200);
        body.put("message", "Lấy danh sách thành công (EN: Get all success)");
        body.put("data", users);                              // the actual payload
        body.put("timestamp", java.time.Instant.now().toString());  // ISO 8601 for log correlation
        return ResponseEntity.ok(body);
    }

    /**
     * GET /users/{id} — looks up a user by id; throws a structured NotFoundException when absent.
     *
     * <p>Non-numeric ids are treated the same as missing numeric ids: both throw
     * {@link NotFoundException} with {@code { resource, id }} details so the error envelope
     * is consistent regardless of how the lookup fails.</p>
     *
     * @param id the path variable (string from the URL, parsed to int internally).
     * @return HTTP 200 with the found user in the success envelope.
     * @throws NotFoundException HTTP 404 with structured details when the user is not found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> findOne(@PathVariable String id) {
        int parsedId;
        try {
            // Attempt to parse the string id; throws NumberFormatException for "boom" etc.
            parsedId = Integer.parseInt(id);
        } catch (NumberFormatException e) {
            // Non-numeric id is treated as "not found" — same error shape as a missing numeric id.
            throw new NotFoundException("User with ID " + id + " not found", "user", id);
        }

        // Stream the in-memory list looking for a matching id;
        // orElseThrow wraps the absence into our NotFoundException which the handler maps to 404.
        User user = users.stream()
                .filter(u -> u.getId() == parsedId)
                .findFirst()
                .orElseThrow(() -> new NotFoundException("User with ID " + id + " not found", "user", id));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("statusCode", 200);
        body.put("message", "Lấy thông tin thành công (EN: Find user success)");
        body.put("data", user);
        body.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(body);
    }

    /**
     * POST /users — validates the JSON payload and creates a new user.
     *
     * <p>Validation is done manually here (rather than via {@code @Valid}) to keep the
     * error envelope format consistent with the other language implementations.
     * A {@link BadRequestException} carries the list of field error messages which the
     * handler promotes to the {@code details} array in the error envelope.</p>
     *
     * @param payload the raw JSON body; expected to contain a {@code name} string field.
     * @return HTTP 201 with the newly created user in the success envelope.
     * @throws BadRequestException HTTP 400 when {@code name} is missing, not a string,
     *         or shorter than 3 characters.
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> payload) {
        List<String> messages = new ArrayList<>();

        Object nameObj = payload.get("name");
        if (!(nameObj instanceof String)) {
            // Name is absent or not a string — add both the type error and the length error
            // so the client can show all problems at once rather than one at a time.
            messages.add("name must be a string");
            messages.add("Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)");
        } else {
            String name = (String) nameObj;
            if (name.length() < 3) {
                // Name is a string but too short — only the length error applies.
                messages.add("Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)");
            }
        }

        if (!messages.isEmpty()) {
            // Throw BadRequestException with the full list; the handler converts it to
            // { statusCode:400, error:"BadRequestException", message:"...", details:[...] }.
            throw new BadRequestException(messages);
        }

        // At this point nameObj is a validated String — safe to cast.
        String name = ((String) nameObj).trim();  // trim surrounding whitespace
        User user = new User(nextId++, name);     // assign monotonic id then increment
        users.add(user);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("statusCode", 201);
        body.put("message", "Tạo thành công (EN: Create success)");
        body.put("data", user);
        body.put("timestamp", java.time.Instant.now().toString());

        // Return 201 Created (not 200) to follow HTTP semantics for resource creation.
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    // ---------------------------------------------------------------------------
    // Domain exceptions — thrown by the controller, caught by GlobalExceptionHandler
    // ---------------------------------------------------------------------------

    /**
     * Domain exception representing a missing resource (maps to HTTP 404).
     *
     * <p>Carries {@code resource} and {@code id} so the error envelope can include
     * machine-readable {@code details: { resource, id }} for the client to act on.</p>
     */
    public static class NotFoundException extends RuntimeException {
        /** The resource type that was not found (e.g. "user"). */
        private final String resource;

        /** The identifier that was looked up (string from the URL). */
        private final String id;

        /**
         * @param message  human-readable message for the error envelope {@code message} field.
         * @param resource resource type label (e.g. "user").
         * @param id       the id value that was not found.
         */
        public NotFoundException(String message, String resource, String id) {
            super(message);
            this.resource = resource;
            this.id = id;
        }

        /** Returns the resource type label. */
        public String getResource() { return resource; }

        /** Returns the looked-up id string. */
        public String getId() { return id; }
    }

    /**
     * Domain exception representing a bad request (maps to HTTP 400).
     *
     * <p>Carries a list of field-level error messages so the error envelope can
     * include {@code details: ["...", "..."]} for the client to highlight specific fields.</p>
     */
    public static class BadRequestException extends RuntimeException {
        /** All field error messages collected during validation. */
        private final List<String> messages;

        /**
         * @param messages list of human-readable field error strings (at least one).
         */
        public BadRequestException(List<String> messages) {
            this.messages = messages;
        }

        /** Returns all field error messages. */
        public List<String> getMessages() { return messages; }
    }

    // ---------------------------------------------------------------------------
    // Global exception handler — single point that converts exceptions to error envelopes
    // ---------------------------------------------------------------------------

    /**
     * Centralized exception handler for all controllers.
     *
     * <p>{@code @RestControllerAdvice} applies this handler globally.  Every exception thrown
     * by any controller reaches one of the {@code @ExceptionHandler} methods below, which
     * normalize it into the unified error envelope {@code { statusCode, error, message, details?,
     * timestamp, path }}.  Stack traces and internal details are never passed to the client.</p>
     */
    @RestControllerAdvice
    public static class GlobalExceptionHandler {

        /**
         * Handles domain {@link NotFoundException} — serializes structured
         * {@code details: { resource, id }} into the error envelope.
         *
         * @param ex      the caught exception carrying resource/id.
         * @param request the HTTP request providing the URI for the {@code path} field.
         * @return HTTP 404 with the unified error envelope.
         */
        @ExceptionHandler(NotFoundException.class)
        public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException ex, HttpServletRequest request) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("statusCode", 404);
            body.put("error", "NotFoundException");   // class name used as discriminator
            body.put("message", ex.getMessage());     // domain message set at throw-site

            // Build the structured details object so clients can pinpoint which resource
            // was missing without parsing the message string.
            Map<String, String> details = new LinkedHashMap<>();
            details.put("resource", ex.getResource());
            details.put("id", ex.getId());
            body.put("details", details);

            body.put("timestamp", java.time.Instant.now().toString());
            body.put("path", request.getRequestURI());  // exact URI for tracing
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
        }

        /**
         * Handles validation {@link BadRequestException} — promotes the list of field
         * error messages to {@code details} (array) in the error envelope.
         *
         * @param ex      the caught exception carrying field error messages.
         * @param request the HTTP request providing the URI.
         * @return HTTP 400 with the unified error envelope.
         */
        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("statusCode", 400);
            body.put("error", "BadRequestException");
            // Join all messages into one string for the `message` field (human-readable summary).
            body.put("message", String.join(", ", ex.getMessages()));
            // Preserve the array as `details` so clients can iterate individual field errors.
            body.put("details", ex.getMessages());
            body.put("timestamp", java.time.Instant.now().toString());
            body.put("path", request.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }

        /**
         * Catch-all handler for any unrecognized exception.
         *
         * <p>Intentionally uses a generic message ("Internal Server Error") and does NOT
         * include {@code ex.getMessage()} — to prevent stack traces or internal details
         * (SQL, secret values) from leaking to the client.  Log the exception server-side.</p>
         *
         * @param ex      any exception not matched by the more specific handlers.
         * @param request the HTTP request providing the URI.
         * @return HTTP 500 with a generic error envelope (no stack, no internal message).
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex, HttpServletRequest request) {
            // Never use ex.getMessage() here — it may contain SQL, file paths, or secrets.
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("statusCode", 500);
            body.put("error", "Internal Error");
            body.put("message", "Internal Server Error");  // safe generic message only
            body.put("timestamp", java.time.Instant.now().toString());
            body.put("path", request.getRequestURI());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }
}
