package academy.starci.val;

/**
 * Immutable value object representing a user in the in-memory store.
 *
 * <p>Jackson uses the no-arg constructor + setters for deserialization (if ever needed),
 * and the getters for JSON serialization into the {@code data} field of the success envelope.</p>
 */
public class User {

    /** Monotonic identifier assigned by {@code UserController}. */
    private int id;

    /** Display name; must be at least 3 characters (validated by the controller). */
    private String name;

    /**
     * No-arg constructor required by Jackson for deserialization.
     */
    public User() {}

    /**
     * Creates a fully initialized user.
     *
     * @param id   monotonic identifier (assigned by the controller).
     * @param name display name (already validated to be ≥ 3 chars).
     */
    public User(int id, String name) {
        this.id = id;
        this.name = name;
    }

    /**
     * Returns the user's numeric identifier.
     *
     * @return the id.
     */
    public int getId() {
        return id;
    }

    /**
     * Sets the user's numeric identifier (used by Jackson deserialization).
     *
     * @param id the id to set.
     */
    public void setId(int id) {
        this.id = id;
    }

    /**
     * Returns the user's display name.
     *
     * @return the name.
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the user's display name (used by Jackson deserialization).
     *
     * @param name the name to set.
     */
    public void setName(String name) {
        this.name = name;
    }
}
