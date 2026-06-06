package academy.starci.swagger;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Provides canonical path aliases so all four language implementations expose
 * the same URL surface ({@code /swagger} and {@code /swagger-json}).
 *
 * <p>springdoc-openapi mounts the Swagger UI at {@code /swagger-ui/index.html} and the spec
 * at {@code /v3/api-docs} by default. This controller forwards the lesson-standard paths to
 * those defaults so the e2e flows work identically across TypeScript, Java, C#, and Go.</p>
 */
@Controller
public class CustomSwaggerController {

    /**
     * Forwards {@code GET /swagger} to the springdoc Swagger UI entry point.
     *
     * @return Spring MVC forward directive (not a redirect; the browser URL stays {@code /swagger}).
     */
    @GetMapping("/swagger")
    public String redirectToSwaggerUi() {
        // "forward:" uses the Servlet forward mechanism — the original request is re-dispatched
        // internally; no round-trip to the client (unlike "redirect:").
        return "forward:/swagger-ui/index.html";
    }

    /**
     * Forwards {@code GET /swagger-json} to the springdoc OpenAPI JSON endpoint.
     *
     * @return Spring MVC forward directive.
     */
    @GetMapping("/swagger-json")
    public String redirectToSwaggerJson() {
        // /v3/api-docs is the springdoc default; the spec is generated lazily on first request.
        return "forward:/v3/api-docs";
    }
}
