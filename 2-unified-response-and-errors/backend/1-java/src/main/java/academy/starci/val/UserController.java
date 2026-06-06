package academy.starci.val;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/users")
public class UserController {

    private final List<User> users = new CopyOnWriteArrayList<>(List.of(new User(1, "John Doe")));
    private int nextId = 2;

    @GetMapping
    public ResponseEntity<Map<String, Object>> findAll() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("statusCode", 200);
        body.put("message", "Lấy danh sách thành công (EN: Get all success)");
        body.put("data", users);
        body.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> findOne(@PathVariable String id) {
        int parsedId;
        try {
            parsedId = Integer.parseInt(id);
        } catch (NumberFormatException e) {
            throw new NotFoundException("User with ID " + id + " not found", "user", id);
        }

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

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> payload) {
        List<String> messages = new ArrayList<>();
        
        Object nameObj = payload.get("name");
        if (!(nameObj instanceof String)) {
            messages.add("name must be a string");
            messages.add("Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)");
        } else {
            String name = (String) nameObj;
            if (name.length() < 3) {
                messages.add("Tên quá ngắn — tối thiểu 3 ký tự (EN: Name too short — min 3 chars)");
            }
        }

        if (!messages.isEmpty()) {
            throw new BadRequestException(messages);
        }

        String name = ((String) nameObj).trim();
        User user = new User(nextId++, name);
        users.add(user);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("statusCode", 201);
        body.put("message", "Tạo thành công (EN: Create success)");
        body.put("data", user);
        body.put("timestamp", java.time.Instant.now().toString());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    // Exceptions
    public static class NotFoundException extends RuntimeException {
        private final String resource;
        private final String id;

        public NotFoundException(String message, String resource, String id) {
            super(message);
            this.resource = resource;
            this.id = id;
        }

        public String getResource() { return resource; }
        public String getId() { return id; }
    }

    public static class BadRequestException extends RuntimeException {
        private final List<String> messages;

        public BadRequestException(List<String> messages) {
            this.messages = messages;
        }

        public List<String> getMessages() { return messages; }
    }

    // Exception Handler Advice
    @RestControllerAdvice
    public static class GlobalExceptionHandler {

        @ExceptionHandler(NotFoundException.class)
        public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException ex, HttpServletRequest request) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("statusCode", 404);
            body.put("error", "NotFoundException");
            body.put("message", ex.getMessage());
            
            Map<String, String> details = new LinkedHashMap<>();
            details.put("resource", ex.getResource());
            details.put("id", ex.getId());
            body.put("details", details);
            
            body.put("timestamp", java.time.Instant.now().toString());
            body.put("path", request.getRequestURI());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
        }

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("statusCode", 400);
            body.put("error", "BadRequestException");
            body.put("message", String.join(", ", ex.getMessages()));
            body.put("details", ex.getMessages());
            body.put("timestamp", java.time.Instant.now().toString());
            body.put("path", request.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex, HttpServletRequest request) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("statusCode", 500);
            body.put("error", "Internal Error");
            body.put("message", "Internal Server Error");
            body.put("timestamp", java.time.Instant.now().toString());
            body.put("path", request.getRequestURI());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }
}
