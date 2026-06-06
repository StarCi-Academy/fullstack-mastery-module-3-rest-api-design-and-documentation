package academy.starci.val;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

/**
 * Custom error controller that replaces Spring Boot's default whitespace/HTML error page.
 *
 * <p>When a request matches no handler route, the servlet container forwards to {@code /error}
 * instead of returning a response directly.  Without this controller Spring Boot would render
 * an HTML page (or a partial JSON Whitelabel error), breaking the unified error envelope
 * contract.  This controller intercepts that forward and returns a proper JSON error envelope.</p>
 *
 * <p>Implements {@link ErrorController} so Spring Boot registers it as the error endpoint
 * rather than the default BasicErrorController.</p>
 */
@RestController
public class CustomErrorController implements ErrorController {

    /**
     * Handles all requests forwarded to the {@code /error} path by the servlet container.
     *
     * <p>Reads the original status code and request URI from servlet attributes set by the
     * container before the forward, then builds the appropriate error envelope:
     * <ul>
     *   <li>Status 404 → {@code error: "NotFoundException"} with a "Cannot METHOD PATH" message.</li>
     *   <li>Any other status → {@code error: "Internal Error"} with a generic message.</li>
     * </ul>
     *
     * @param request the HTTP servlet request (after the container forward to /error).
     * @return an appropriate error envelope in the unified contract shape.
     */
    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        // Retrieve the status code that triggered the forward; default to 500 if unavailable.
        Object status = request.getAttribute("jakarta.servlet.error.status_code");
        int statusCode = status != null ? Integer.parseInt(status.toString()) : 500;

        // Retrieve the original request URI (the path that caused the error, not "/error").
        Object pathObj = request.getAttribute("jakarta.servlet.error.request_uri");
        String path = pathObj != null ? pathObj.toString() : "";

        Map<String, Object> body = new LinkedHashMap<>();  // LinkedHashMap preserves insertion order in JSON
        body.put("statusCode", statusCode);

        if (statusCode == 404) {
            // 404 from the servlet container means no route matched — format like NotFoundException.
            body.put("error", "NotFoundException");
            // "Cannot METHOD PATH" mirrors how NestJS and Express format unmatched-route errors.
            body.put("message", "Cannot " + request.getMethod() + " " + path);
        } else {
            // All other statuses (400 from Spring's built-in validation, 5xx from infrastructure)
            // use a generic message to avoid leaking internal details.
            body.put("error", "Internal Error");
            body.put("message", "Internal Server Error");
        }

        body.put("timestamp", java.time.Instant.now().toString());  // ISO 8601
        body.put("path", path);  // original path (not "/error") for tracing

        return ResponseEntity.status(statusCode).body(body);
    }
}
