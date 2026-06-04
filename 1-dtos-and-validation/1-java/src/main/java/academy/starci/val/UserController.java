package academy.starci.val;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/users")
public class UserController {

    private final List<User> users = new CopyOnWriteArrayList<>();

    private String nextUniqueShortId() {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        Random rnd = new Random();
        for (int i = 0; i < 32; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < 6; j++) {
                sb.append(chars.charAt(rnd.nextInt(chars.length())));
            }
            String candidate = sb.toString();
            boolean exists = users.stream().anyMatch(u -> u.getId().equals(candidate));
            if (!exists) {
                return candidate;
            }
        }
        return UUID.randomUUID().toString().substring(0, 6);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        List<String> messages = new ArrayList<>();

        // Validate name
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

        // Validate email
        Object emailObj = payload.get("email");
        if (!(emailObj instanceof String) || !((String) emailObj).contains("@")) {
            messages.add("Email không hợp lệ (EN: Invalid email)");
        }

        // Validate age
        Object ageObj = payload.get("age");
        if (ageObj == null) {
            messages.add("age must be an integer number");
            messages.add("age must not be less than 18");
            messages.add("age must not be greater than 100");
        } else if (!(ageObj instanceof Number)) {
            messages.add("age must be an integer number");
            messages.add("age must not be less than 18");
            messages.add("age must not be greater than 100");
        } else {
            Number num = (Number) ageObj;
            double val = num.doubleValue();
            if (val != Math.floor(val) || Double.isInfinite(val)) {
                messages.add("age must be an integer number");
            }
            if (val < 18) {
                messages.add("age must not be less than 18");
            }
            if (val > 100) {
                messages.add("age must not be greater than 100");
            }
        }

        // Validate address (optional)
        if (payload.containsKey("address") && payload.get("address") != null) {
            Object addrObj = payload.get("address");
            if (addrObj instanceof Map) {
                Map<?, ?> addr = (Map<?, ?>) addrObj;
                // Validate city
                Object cityObj = addr.get("city");
                if (!(cityObj instanceof String) || ((String) cityObj).length() < 2 || ((String) cityObj).length() > 100) {
                    messages.add("address.City phải dài 2-100 ký tự (EN: city must be 2-100 chars)");
                }
                // Validate zip
                Object zipObj = addr.get("zip");
                if (!(zipObj instanceof String) || !((String) zipObj).toString().matches("^\\d{4,10}$")) {
                    messages.add("address.ZIP phải gồm 4-10 chữ số (EN: ZIP must be 4-10 digits)");
                }
            } else {
                messages.add("address must be an object");
            }
        }

        if (!messages.isEmpty()) {
            Map<String, Object> errorBody = new LinkedHashMap<>();
            errorBody.put("statusCode", 400);
            errorBody.put("message", messages);
            errorBody.put("error", "Bad Request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody);
        }

        String id = nextUniqueShortId();
        String name = (String) payload.get("name");
        String email = (String) payload.get("email");
        Integer age = ((Number) payload.get("age")).intValue();
        @SuppressWarnings("unchecked")
        Map<String, Object> address = (Map<String, Object>) payload.get("address");

        User user = new User(id, name, email, age, address);
        users.add(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @GetMapping
    public List<User> findAll(@RequestParam(value = "page", defaultValue = "1") int page,
                              @RequestParam(value = "limit", defaultValue = "10") int limit) {
        int fromIndex = (page - 1) * limit;
        if (fromIndex >= users.size()) {
            return Collections.emptyList();
        }
        int toIndex = Math.min(fromIndex + limit, users.size());
        return users.subList(fromIndex, toIndex);
    }
}
