package academy.starci.crud;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Spring Data JPA repository for {@link User} entities.
 * <p>
 * Extends {@link JpaRepository} to inherit standard CRUD operations
 * ({@code save}, {@code findById}, {@code existsById}, {@code deleteById}, etc.)
 * without any implementation code — Spring generates the proxy at startup.
 * </p>
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    /**
     * Returns all users sorted by {@code id} ascending.
     * <p>
     * Spring Data derives the query from the method name:
     * {@code findAll} + {@code By} (no filter) + {@code OrderBy} + {@code Id} + {@code Asc}.
     * The stable ordering ensures consistent output across curl test runs.
     * </p>
     *
     * @return list of all users ordered by id, possibly empty.
     */
    List<User> findAllByOrderByIdAsc();
}
