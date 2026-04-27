package movie.swp391.repository;

import movie.swp391.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    Optional<Account> findByUsername(String username);
    boolean existsByUsername(String username);

    @Query("SELECT a FROM Account a JOIN a.customer c WHERE c.email = :email")
    Optional<Account> findByCustomerEmail(@Param("email") String email);

    @Query("SELECT a FROM Account a JOIN a.customer c WHERE c.email = :email")
    Optional<Account> findByEmail(@Param("email") String email);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Account a JOIN a.customer c WHERE c.email = :email")
    boolean existsByEmail(@Param("email") String email);

    @Query("SELECT a FROM Account a LEFT JOIN FETCH a.role r WHERE a.username = :username")
    Optional<Account> findByUsernameWithRole(@Param("username") String username);}
