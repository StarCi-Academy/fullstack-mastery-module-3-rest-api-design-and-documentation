package academy.starci.crud;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

/**
 * REST controller exposing the {@code /users} resource with full CRUD operations.
 * <p>
 * This controller demonstrates RESTful best practices:
 * <ul>
 *   <li>Correct HTTP status codes (201 for POST, 204 for DELETE, 404 for missing resources).</li>
 *   <li>PUT for full replacement vs PATCH for partial update.</li>
 *   <li>Uniform error shape: {@code {statusCode, message, error}}.</li>
 * </ul>
 * All persistence is delegated to {@link UserRepository}; no SQL is written here.
 * </p>
 */
@RestController
@RequestMapping("/users")
public class UserController {

    /**
     * Spring Data repository injected by the IoC container.
     * Handles all DB interactions (find, save, delete).
     */
    @Autowired
    private UserRepository userRepository;

    /**
     * Generates a 5-character alphanumeric ID that does not already exist in the database.
     * <p>
     * Retries up to 32 times before throwing to avoid a hard infinite loop.
     * Collision probability is negligible for small datasets typical of lesson demos.
     * </p>
     *
     * @return a unique 5-character lowercase alphanumeric string.
     * @throws RuntimeException if a unique ID cannot be allocated within the retry budget.
     */
    private String nextUniqueShortId() {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        Random rnd = new Random();
        for (int i = 0; i < 32; i++) {
            StringBuilder sb = new StringBuilder();
            // Build a 5-character candidate from the allowed alphabet.
            for (int j = 0; j < 5; j++) {
                sb.append(chars.charAt(rnd.nextInt(chars.length())));
            }
            String candidate = sb.toString();
            // Only return the candidate when it is not already used as a primary key.
            if (!userRepository.existsById(candidate)) {
                return candidate;
            }
        }
        throw new RuntimeException("Failed to allocate unique user id after retries");
    }

    /**
     * DELETE /users/demo/clear-all — wipe all rows; utility for lesson resets.
     * Returns HTTP 204 No Content on success.
     */
    @DeleteMapping("/demo/clear-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void demoClearAll() {
        // deleteAll() issues a single DELETE FROM users — acceptable for demo scale.
        userRepository.deleteAll();
    }

    /**
     * POST /users/demo/seed-one — insert one fixed demo user.
     * Returns HTTP 201 Created + the seeded user JSON so lesson flows have data to read.
     *
     * @return ResponseEntity wrapping the created User.
     */
    @PostMapping("/demo/seed-one")
    public ResponseEntity<User> demoSeedOne() {
        String id = nextUniqueShortId();
        // Use a fixed name/email so the demo output is reproducible across runs.
        User user = new User(id, "Chelsea Koelpin", "Chelsea_Wolf@hotmail.com");
        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * GET /users — return all users ordered by id ascending.
     * Empty array is valid when no users exist; never returns 404 for this route.
     *
     * @return list of all User records.
     */
    @GetMapping
    public List<User> findAll() {
        // Stable ordering makes curl output deterministic for lesson demonstrations.
        return userRepository.findAllByOrderByIdAsc();
    }

    /**
     * GET /users/{id} — fetch a single user by primary key.
     * Returns 200 + user JSON if found; throws 404 if the id does not exist.
     *
     * @param id the user's primary key.
     * @return the matched User entity.
     * @throws ResponseStatusException HTTP 404 when id is not found.
     */
    @GetMapping("/{id}")
    public User findOne(@PathVariable String id) {
        // orElseThrow maps the Optional.empty() case to a 404 ResponseStatusException.
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with ID " + id + " not found"));
    }

    /**
     * POST /users — create a new user from the JSON request body.
     * The id is assigned server-side; the client sends only name and email.
     * Returns HTTP 201 Created + the new resource.
     *
     * @param payload map of request body fields; name and email are optional (have safe defaults).
     * @return ResponseEntity with 201 status and the created User.
     */
    @PostMapping
    public ResponseEntity<User> create(@RequestBody Map<String, Object> payload) {
        String id = nextUniqueShortId();
        // Fall back to safe defaults when the client omits optional fields.
        String name = payload.containsKey("name") && payload.get("name") != null ? payload.get("name").toString() : "Anonymous";
        String email = payload.containsKey("email") && payload.get("email") != null ? payload.get("email").toString() : "no-email@example.com";
        User user = new User(id, name, email);
        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * PUT /users/{id} — full replacement; ALL fields are overwritten from the body.
     * Absent fields become empty strings (strict PUT semantics — no partial defaults).
     * Returns 200 + updated user; 404 if the id does not exist.
     *
     * @param id      the user's primary key.
     * @param payload complete replacement body; should include both name and email.
     * @return the updated User entity.
     */
    @PutMapping("/{id}")
    public User update(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        // 404 guard — PUT on a non-existent resource is an error in this API design.
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with ID " + id + " not found"));

        // Overwrite both fields unconditionally — null in body becomes empty string.
        String name = payload.get("name") != null ? payload.get("name").toString() : "";
        String email = payload.get("email") != null ? payload.get("email").toString() : "";

        user.setName(name);
        user.setEmail(email);
        return userRepository.save(user);
    }

    /**
     * PATCH /users/{id} — partial update; only fields present in the body are changed.
     * Fields absent from the body retain their current values (unlike PUT).
     * Returns 200 + updated user; 404 if the id does not exist.
     *
     * @param id      the user's primary key.
     * @param payload partial update map; may contain name, email, or both.
     * @return the User entity after the partial update.
     */
    @PatchMapping("/{id}")
    public User patch(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with ID " + id + " not found"));

        // Only update a field when the key is present in the payload (PATCH semantics).
        if (payload.containsKey("name")) {
            user.setName(payload.get("name") != null ? payload.get("name").toString() : "");
        }
        if (payload.containsKey("email")) {
            user.setEmail(payload.get("email") != null ? payload.get("email").toString() : "");
        }
        return userRepository.save(user);
    }

    /**
     * DELETE /users/{id} — remove user by primary key.
     * Returns HTTP 204 No Content on success; 404 if the id does not exist.
     *
     * @param id the user's primary key.
     * @throws ResponseStatusException HTTP 404 when id is not found.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable String id) {
        // Check existence first so we can return 404 instead of silently no-oping.
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cannot delete: User not found");
        }
        userRepository.deleteById(id);
    }

    /**
     * Global exception handler scoped to this controller.
     * <p>
     * Converts {@link ResponseStatusException} (thrown by handler methods above)
     * into the uniform error shape: {@code {statusCode, message, error}}.
     * This matches the contract expected by the lesson test flows.
     * </p>
     */
    @RestControllerAdvice
    public static class GlobalExceptionHandler {

        /**
         * Maps a {@link ResponseStatusException} to a JSON error body with a consistent shape.
         *
         * @param ex the exception carrying HTTP status and reason message.
         * @return ResponseEntity with the error body and the matching HTTP status.
         */
        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
            Map<String, Object> body = new LinkedHashMap<>();
            // statusCode mirrors the numeric HTTP status so clients can read it from the body.
            body.put("statusCode", ex.getStatusCode().value());
            body.put("message", ex.getReason());
            // Derive the human-readable error label from the HTTP status code.
            body.put("error", ex.getStatusCode() == HttpStatus.NOT_FOUND ? "Not Found" : "Bad Request");
            return ResponseEntity.status(ex.getStatusCode()).body(body);
        }
    }
}
