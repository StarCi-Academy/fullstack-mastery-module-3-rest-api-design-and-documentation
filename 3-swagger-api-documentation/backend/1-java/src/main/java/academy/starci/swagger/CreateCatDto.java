package academy.starci.swagger;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Data Transfer Object for the POST /cats request body.
 * The {@code @Schema} annotations provide field-level metadata that springdoc-openapi
 * includes in the generated spec under {@code components/schemas/CreateCatDto}.
 */
public class CreateCatDto {

    /** Breed of the cat (e.g. "Persian"). Used as the stored {@code name} field. */
    @Schema(example = "Persian", description = "Breed of the cat")
    private String breed;

    /** Age of the cat in years. */
    @Schema(example = "2", description = "Age in years")
    private Integer age;

    /**
     * Returns the breed.
     *
     * @return cat breed string.
     */
    public String getBreed() {
        return breed;
    }

    /**
     * Sets the breed.
     *
     * @param breed cat breed string.
     */
    public void setBreed(String breed) {
        this.breed = breed;
    }

    /**
     * Returns the age.
     *
     * @return age in years.
     */
    public Integer getAge() {
        return age;
    }

    /**
     * Sets the age.
     *
     * @param age age in years.
     */
    public void setAge(Integer age) {
        this.age = age;
    }
}
