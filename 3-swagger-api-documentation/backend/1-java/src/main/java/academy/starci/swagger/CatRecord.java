package academy.starci.swagger;

/**
 * Represents a single cat record stored in the in-memory collection.
 * The getter/setter pattern allows Jackson to serialise/deserialise this POJO as JSON.
 */
public class CatRecord {

    /** Display name of the cat (mapped from the {@code breed} field on creation). */
    private String name;

    /** Age of the cat in years. */
    private int age;

    /** No-arg constructor required by Jackson for deserialisation. */
    public CatRecord() {}

    /**
     * Creates a cat record with the given name and age.
     *
     * @param name display name (derived from the breed provided at creation time).
     * @param age  age in years.
     */
    public CatRecord(String name, int age) {
        this.name = name;
        this.age = age;
    }

    /**
     * Returns the cat's name.
     *
     * @return name string.
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the cat's name.
     *
     * @param name display name.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the cat's age.
     *
     * @return age in years.
     */
    public int getAge() {
        return age;
    }

    /**
     * Sets the cat's age.
     *
     * @param age age in years.
     */
    public void setAge(int age) {
        this.age = age;
    }
}
