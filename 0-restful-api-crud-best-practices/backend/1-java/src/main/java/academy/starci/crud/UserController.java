package academy.starci.crud;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    private String nextUniqueShortId() {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        Random rnd = new Random();
        for (int i = 0; i < 32; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < 5; j++) {
                sb.append(chars.charAt(rnd.nextInt(chars.length())));
            }
            String candidate = sb.toString();
            if (!userRepository.existsById(candidate)) {
                return candidate;
            }
        }
        throw new RuntimeException("Failed to allocate unique user id after retries");
    }

    @DeleteMapping("/demo/clear-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void demoClearAll() {
        userRepository.deleteAll();
    }

    @PostMapping("/demo/seed-one")
    public ResponseEntity<User> demoSeedOne() {
        String id = nextUniqueShortId();
        User user = new User(id, "Chelsea Koelpin", "Chelsea_Wolf@hotmail.com");
        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<User> findAll() {
        return userRepository.findAllByOrderByIdAsc();
    }

    @GetMapping("/{id}")
    public User findOne(@PathVariable String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with ID " + id + " not found"));
    }

    @PostMapping
    public ResponseEntity<User> create(@RequestBody Map<String, Object> payload) {
        String id = nextUniqueShortId();
        String name = payload.containsKey("name") && payload.get("name") != null ? payload.get("name").toString() : "Anonymous";
        String email = payload.containsKey("email") && payload.get("email") != null ? payload.get("email").toString() : "no-email@example.com";
        User user = new User(id, name, email);
        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with ID " + id + " not found"));
        
        String name = payload.get("name") != null ? payload.get("name").toString() : "";
        String email = payload.get("email") != null ? payload.get("email").toString() : "";
        
        user.setName(name);
        user.setEmail(email);
        return userRepository.save(user);
    }

    @PatchMapping("/{id}")
    public User patch(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with ID " + id + " not found"));
        
        if (payload.containsKey("name")) {
            user.setName(payload.get("name") != null ? payload.get("name").toString() : "");
        }
        if (payload.containsKey("email")) {
            user.setEmail(payload.get("email") != null ? payload.get("email").toString() : "");
        }
        return userRepository.save(user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cannot delete: User not found");
        }
        userRepository.deleteById(id);
    }

    @RestControllerAdvice
    public static class GlobalExceptionHandler {
        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("statusCode", ex.getStatusCode().value());
            body.put("message", ex.getReason());
            body.put("error", ex.getStatusCode() == HttpStatus.NOT_FOUND ? "Not Found" : "Bad Request");
            return ResponseEntity.status(ex.getStatusCode()).body(body);
        }
    }
}
