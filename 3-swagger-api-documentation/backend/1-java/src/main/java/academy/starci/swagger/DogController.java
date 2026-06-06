package academy.starci.swagger;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

/**
 * REST controller for the /dogs resource.
 * Demonstrates a second Swagger {@code @Tag} ("Dogs Module") so students can see
 * how springdoc groups operations into separate sections in the Swagger UI.
 */
@RestController
@RequestMapping("/dogs")
@Tag(name = "Dogs Module")
public class DogController {

    /**
     * Returns an empty dogs list wrapped in the unified success envelope.
     * The empty list illustrates that the endpoint is functional even with no seeded data.
     *
     * @return 200 response with {@code {statusCode, message, data, timestamp}}.
     */
    @GetMapping
    @Operation(summary = "Retrieve all dogs")
    @ApiResponse(responseCode = "200", description = "List of dogs returned")
    public ResponseEntity<Map<String, Object>> findAll() {
        // LinkedHashMap preserves insertion order for a consistent envelope field sequence.
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("statusCode", 200);
        body.put("message", "Success");
        body.put("data", Collections.emptyList());  // empty list — dogs store not seeded
        body.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(body);
    }
}
