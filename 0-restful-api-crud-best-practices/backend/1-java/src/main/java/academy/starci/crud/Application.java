package academy.starci.crud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the RESTful CRUD demo Spring Boot application.
 * <p>
 * {@code @SpringBootApplication} enables component scanning, auto-configuration,
 * and property-source loading in a single annotation — equivalent to combining
 * {@code @Configuration}, {@code @EnableAutoConfiguration}, and {@code @ComponentScan}.
 * </p>
 */
@SpringBootApplication
public class Application {

    /**
     * Bootstraps the Spring application context and starts the embedded Tomcat server.
     *
     * @param args command-line arguments forwarded to the Spring environment (e.g. {@code --server.port=3001}).
     */
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
