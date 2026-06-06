package academy.starci.swagger;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CustomSwaggerController {

    @GetMapping("/swagger")
    public String redirectToSwaggerUi() {
        return "forward:/swagger-ui/index.html";
    }

    @GetMapping("/swagger-json")
    public String redirectToSwaggerJson() {
        return "forward:/v3/api-docs";
    }
}
