// Move TemporaryAccountRepository to the repository package
package movie.swp391.repository;

import movie.swp391.entity.TemporaryAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TemporaryAccountRepository extends JpaRepository<TemporaryAccount, Integer> {
    Optional<TemporaryAccount> findByEmail(String email);
    Optional<TemporaryAccount> findByUsername(String username);
} 