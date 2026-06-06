package academy.starci.swagger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot application entry point for the Swagger API Documentation lesson.
 * Bootstraps the embedded Tomcat server on the port configured in application.properties.
 */
@SpringBootApplication
public class Application {

    /**
     * Launches the Spring Boot application.
     *
     * @param args command-line arguments passed to Spring (e.g. --server.port=3001).
     */
    public static void main(String[] args) {
        // SpringApplication.run initialises the Spring context, starts the embedded server,
        // and triggers component scanning for @RestController, @Configuration, etc.
        SpringApplication.run(Application.class, args);
    }
}
