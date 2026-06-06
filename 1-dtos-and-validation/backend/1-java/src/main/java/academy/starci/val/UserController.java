package academy.starci.val;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * REST controller for the User resource — demonstrates boundary validation in Java.
 *
 * In Java (without a framework-level ValidationPipe equivalent), validation logic is
 * written explicitly inside the handler method. The principle is the same: check all
 * constraints at the boundary, collect errors into a list, and reject the request with
 * HTTP 400 + the error array BEFORE any business logic runs.
 *
 * The in-memory store ({@link CopyOnWriteArrayList}) replaces a real database so the
 * demo runs without any infrastructure setup.
 */
@RestController
@RequestMapping("/users")
public class UserController {

    /**
     * Thread-safe in-memory list acting as the user store for this demo.
     * CopyOnWriteArrayList allows concurrent reads without explicit synchronisation;
     * writes (add) create a copy of the underlying array.
     */
    private final List<User> users = new CopyOnWriteArrayList<>();

    /**
     * Generate a collision-free 6-character alphanumeric id for a new user.
     *
     * Uses a bounded retry loop (32 attempts) to avoid an infinite loop if the id
     * space somehow fills up. Falls back to a UUID prefix as a safety net.
     *
     * @return A unique 6-character lowercase alphanumeric string.
     */
    private String nextUniqueShortId() {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        Random rnd = new Random();
        // Retry up to 32 times before falling back — practically never needed in a demo.
        for (int i = 0; i < 32; i++) {
            // Build a 6-character random string from the allowed character set.
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < 6; j++) {
                sb.append(chars.charAt(rnd.nextInt(chars.length())));
            }
            String candidate = sb.toString();
            // Check whether the candidate is already taken by any existing user.
            boolean exists = users.stream().anyMatch(u -> u.getId().equals(candidate));
            if (!exists) {
                // Found a free id — return immediately.
                return candidate;
            }
        }
        // Safety net: use a UUID prefix if 32 random ids all collided (extremely unlikely).
        return UUID.randomUUID().toString().substring(0, 6);
    }

    /**
     * Create a new user after validating the request body at the boundary.
     *
     * Validation is performed manually field by field. All failures are collected into
     * a {@code messages} list. If any failure exists the handler returns HTTP 400 with
     * the full error array — no user is created.
     *
     * @param payload Raw JSON body decoded as a generic Map so we can inspect each field's
     *                type independently and produce accurate error messages.
     * @return HTTP 201 with the new user on success, or HTTP 400 with the error array on failure.
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        // Collect all validation errors before deciding to accept or reject the request.
        List<String> messages = new ArrayList<>();

        // --- Validate name ---
        Object nameObj = payload.get("name");
        if (!(nameObj instanceof String)) {
            // name is missing or not a string — add both the type error and the min-length error.
            messages.add("name must be a string");
            messages.add("Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)");
        } else {
            String name = (String) nameObj;
            if (name.length() < 3) {
                // name is a string but shorter than the minimum 3 characters.
                messages.add("Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)");
            }
        }

        // --- Validate email ---
        Object emailObj = payload.get("email");
        if (!(emailObj instanceof String) || !((String) emailObj).contains("@")) {
            // Simple "@" presence check — sufficient for the demo (a real app uses a regex).
            messages.add("Email không hợp lệ (EN: Invalid email)");
        }

        // --- Validate age ---
        Object ageObj = payload.get("age");
        if (ageObj == null) {
            // age is completely absent from the payload.
            messages.add("age must be an integer number");
            messages.add("age must not be less than 18");
            messages.add("age must not be greater than 100");
        } else if (!(ageObj instanceof Number)) {
            // age is present but not a numeric JSON value.
            messages.add("age must be an integer number");
            messages.add("age must not be less than 18");
            messages.add("age must not be greater than 100");
        } else {
            Number num = (Number) ageObj;
            double val = num.doubleValue();
            // Reject non-integer numbers (e.g. 25.5) — age must be a whole number.
            if (val != Math.floor(val) || Double.isInfinite(val)) {
                messages.add("age must be an integer number");
            }
            // Check lower bound: must be at least 18.
            if (val < 18) {
                messages.add("age must not be less than 18");
            }
            // Check upper bound: must not exceed 100.
            if (val > 100) {
                messages.add("age must not be greater than 100");
            }
        }

        // --- Validate address (optional nested object) ---
        if (payload.containsKey("address") && payload.get("address") != null) {
            Object addrObj = payload.get("address");
            if (addrObj instanceof Map) {
                Map<?, ?> addr = (Map<?, ?>) addrObj;

                // Validate nested city — must be a string of 2-100 characters.
                Object cityObj = addr.get("city");
                if (!(cityObj instanceof String) || ((String) cityObj).length() < 2 || ((String) cityObj).length() > 100) {
                    messages.add("address.City phải dài 2-100 ký tự (EN: city must be 2-100 chars)");
                }

                // Validate nested zip — must match 4-10 digit pattern.
                Object zipObj = addr.get("zip");
                if (!(zipObj instanceof String) || !((String) zipObj).matches("^\\d{4,10}$")) {
                    // The "address." prefix in the message mirrors the nested path convention
                    // used by NestJS ValidationPipe so all language demos report errors consistently.
                    messages.add("address.ZIP phải gồm 4-10 chữ số (EN: ZIP must be 4-10 digits)");
                }
            } else {
                // address was provided but is not a JSON object.
                messages.add("address must be an object");
            }
        }

        // --- Boundary gate: reject immediately if any error exists ---
        if (!messages.isEmpty()) {
            Map<String, Object> errorBody = new LinkedHashMap<>();
            errorBody.put("statusCode", 400);
            errorBody.put("message", messages);
            errorBody.put("error", "Bad Request");
            // Return 400 with the full error list — business logic is never reached.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody);
        }

        // --- All constraints passed — persist the new user ---
        String id = nextUniqueShortId();
        String name = (String) payload.get("name");
        String email = (String) payload.get("email");
        // Convert the JSON number to a Java int (JSON numbers arrive as Double via Jackson).
        Integer age = ((Number) payload.get("age")).intValue();
        // Cast is safe here because we already validated address is a Map above.
        @SuppressWarnings("unchecked")
        Map<String, Object> address = (Map<String, Object>) payload.get("address");

        // Build and store the new user object in the in-memory list.
        User user = new User(id, name, email, age, address);
        users.add(user);

        // Return 201 Created with the full user record including the generated id.
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    /**
     * Return a paginated list of users sorted by id.
     *
     * @param page  1-based page number; defaults to 1. Spring's @RequestParam handles
     *              the string-to-int coercion automatically — equivalent to @Type(() => Number) in TS.
     * @param limit Items per page; defaults to 10.
     * @return List of users for the requested page, possibly empty.
     */
    @GetMapping
    public List<User> findAll(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        // Compute the zero-based start index from the 1-based page parameter.
        int fromIndex = (page - 1) * limit;
        // Return an empty list when the requested page is beyond the last item.
        if (fromIndex >= users.size()) {
            return Collections.emptyList();
        }
        // Clamp the end index to avoid an IndexOutOfBoundsException on the last page.
        int toIndex = Math.min(fromIndex + limit, users.size());
        return users.subList(fromIndex, toIndex);
    }
}
