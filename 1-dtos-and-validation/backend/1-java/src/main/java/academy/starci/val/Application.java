package academy.starci.val;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Application entry point for the Spring Boot validation demo.
 *
 * This lesson demonstrates boundary validation in Java using manual field checks
 * inside the controller (equivalent role to NestJS ValidationPipe). The in-memory
 * store (a CopyOnWriteArrayList) replaces a real database so no infrastructure is needed.
 */
@SpringBootApplication
public class Application {

    /**
     * Start the Spring Boot application.
     *
     * @param args Command-line arguments forwarded to the Spring context.
     *             No custom args are used by this demo; Spring reads server.port from
     *             application.properties.
     */
    public static void main(String[] args) {
        // SpringApplication.run wires the Spring context, starts the embedded Tomcat server,
        // and registers all @RestController beans automatically.
        SpringApplication.run(Application.class, args);
    }
}
