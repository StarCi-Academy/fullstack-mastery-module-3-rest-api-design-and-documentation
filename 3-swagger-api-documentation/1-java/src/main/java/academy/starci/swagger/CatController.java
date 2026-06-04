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

@RestController
@RequestMapping("/cats")
@Tag(name = "Cats Module")
public class CatController {

    private final List<CatRecord> cats = new CopyOnWriteArrayList<>(List.of(new CatRecord("Milo", 3)));

    @GetMapping
    @Operation(summary = "Retrieve all cats")
    @ApiResponse(responseCode = "200", description = "List of cats returned")
    public ResponseEntity<Map<String, Object>> findAll() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("statusCode", 200);
        body.put("message", "Lấy danh sách mèo thành công (EN: Get all cats success)");
        body.put("data", cats);
        body.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(body);
    }

    @PostMapping
    @Operation(summary = "Create a new cat")
    @ApiResponse(responseCode = "201", description = "Cat created")
    @ApiResponse(responseCode = "400", description = "Invalid payload")
    @SecurityRequirement(name = "bearer")
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> payload) {
        List<String> messages = new ArrayList<>();
        
        Object breedObj = payload.get("breed");
        if (!(breedObj instanceof String)) {
            messages.add("breed must be a string");
        }
        
        Object ageObj = payload.get("age");
        if (!(ageObj instanceof Number)) {
            messages.add("age must be a number conforming to the specified constraints");
        }

        if (!messages.isEmpty()) {
            throw new BadRequestException(String.join(", ", messages));
        }

        String breed = (String) breedObj;
        int age = ((Number) ageObj).intValue();

        CatRecord newCat = new CatRecord(breed, age);
        cats.add(newCat);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("statusCode", 201);
        body.put("message", "Success");
        body.put("data", newCat);
        body.put("timestamp", java.time.Instant.now().toString());

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/error-demo")
    @Operation(summary = "Demo error response (Bad Request)")
    @ApiResponse(responseCode = "400", description = "Simulated bad request for unified error contract")
    public void errorDemo() {
        throw new BadRequestException("Đây là lỗi giả lập để test Unified Error Response");
    }

    public static class BadRequestException extends RuntimeException {
        public BadRequestException(String message) {
            super(message);
        }
    }

    @RestControllerAdvice
    public static class CatExceptionHandler {

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("statusCode", 400);
            body.put("error", "BadRequestException");
            body.put("message", ex.getMessage());
            body.put("timestamp", java.time.Instant.now().toString());
            body.put("path", request.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }
    }
}
