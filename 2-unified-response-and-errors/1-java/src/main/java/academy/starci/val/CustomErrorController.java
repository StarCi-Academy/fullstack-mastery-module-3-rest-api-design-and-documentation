package academy.starci.val;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Object status = request.getAttribute("jakarta.servlet.error.status_code");
        int statusCode = status != null ? Integer.parseInt(status.toString()) : 500;
        
        Object pathObj = request.getAttribute("jakarta.servlet.error.request_uri");
        String path = pathObj != null ? pathObj.toString() : "";
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("statusCode", statusCode);
        
        if (statusCode == 404) {
            body.put("error", "NotFoundException");
            body.put("message", "Cannot " + request.getMethod() + " " + path);
        } else {
            body.put("error", "Internal Error");
            body.put("message", "Internal Server Error");
        }
        
        body.put("timestamp", java.time.Instant.now().toString());
        body.put("path", path);
        
        return ResponseEntity.status(statusCode).body(body);
    }
}
