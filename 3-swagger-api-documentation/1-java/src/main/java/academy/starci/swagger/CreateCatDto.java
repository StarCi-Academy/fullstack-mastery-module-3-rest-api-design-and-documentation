package academy.starci.swagger;

import io.swagger.v3.oas.annotations.media.Schema;

public class CreateCatDto {

    @Schema(example = "Persian", description = "Breed of the cat")
    private String breed;

    @Schema(example = "2", description = "Age in years")
    private Integer age;

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }
}
