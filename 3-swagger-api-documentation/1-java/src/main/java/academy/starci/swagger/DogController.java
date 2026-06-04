package academy.starci.swagger;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
@RequestMapping("/dogs")
@Tag(name = "Dogs Module")
public class DogController {

    @GetMapping
    @Operation(summary = "Retrieve all dogs")
    @ApiResponse(responseCode = "200", description = "List of dogs returned")
    public ResponseEntity<Map<String, Object>> findAll() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("statusCode", 200);
        body.put("message", "Success");
        body.put("data", Collections.emptyList());
        body.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(body);
    }
}
