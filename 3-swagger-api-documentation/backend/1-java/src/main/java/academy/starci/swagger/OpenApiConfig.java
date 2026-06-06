package academy.starci.swagger;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures the OpenAPI (Swagger) document metadata and global security scheme.
 * springdoc-openapi scans this {@code @Bean} at startup and merges it with the
 * annotations on each {@code @RestController} to produce the final spec.
 */
@Configuration
public class OpenApiConfig {

    /**
     * Defines the OpenAPI document with:
     * <ul>
     *   <li>API info (title, description, version)</li>
     *   <li>A {@code bearer} HTTP security scheme so the Swagger UI renders the Authorize button</li>
     * </ul>
     *
     * @return a configured {@link OpenAPI} instance consumed by springdoc.
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                // Info block appears at the top of the Swagger UI page.
                .info(new Info()
                        .title("StarCi Academy Backend")
                        .description("API documentation for the REST API Design & Documentation lesson")
                        .version("1.0"))
                // Components.securitySchemes declares schemes referenced by @SecurityRequirement
                // on individual operations (e.g. POST /cats).
                .components(new Components()
                        .addSecuritySchemes("bearer", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)   // HTTP scheme (not apiKey/oauth2)
                                .scheme("bearer")                  // Authorization: Bearer <token>
                                .bearerFormat("JWT")));            // hint for documentation only
    }
}
