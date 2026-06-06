package academy.starci.crud;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * JPA entity representing a user row in the {@code users} PostgreSQL table.
 * <p>
 * The {@code @Table(name = "users")} annotation maps this class to the lowercase
 * table name so the generated SQL matches the schema created by {@code EnsureCreated} /
 * Spring's DDL auto-create without case-sensitivity issues.
 * </p>
 */
@Entity
@Table(name = "users")
public class User {

    /**
     * Application-assigned primary key (5-char alphanumeric short ID).
     * Max length 36 accommodates future UUID migration without schema change.
     */
    @Id
    @Column(length = 36)
    private String id;

    /**
     * Display name of the user; required, max 255 characters.
     */
    @Column(nullable = false, length = 255)
    private String name;

    /**
     * Email address of the user; required, max 255 characters.
     */
    @Column(nullable = false, length = 255)
    private String email;

    /**
     * No-arg constructor required by JPA for entity instantiation via reflection.
     */
    public User() {}

    /**
     * Convenience constructor for creating a fully-populated User.
     *
     * @param id    the short alphanumeric ID assigned by the server.
     * @param name  the display name.
     * @param email the email address.
     */
    public User(String id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    /**
     * Returns the primary key of this user.
     *
     * @return the alphanumeric ID string.
     */
    public String getId() {
        return id;
    }

    /**
     * Sets the primary key; normally only called by the application on creation.
     *
     * @param id the new ID value.
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Returns the display name.
     *
     * @return name string.
     */
    public String getName() {
        return name;
    }

    /**
     * Replaces the display name; used by PUT (full replace) and PATCH (partial update).
     *
     * @param name the new display name.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the email address.
     *
     * @return email string.
     */
    public String getEmail() {
        return email;
    }

    /**
     * Replaces the email address; used by PUT and PATCH.
     *
     * @param email the new email address.
     */
    public void setEmail(String email) {
        this.email = email;
    }
}
