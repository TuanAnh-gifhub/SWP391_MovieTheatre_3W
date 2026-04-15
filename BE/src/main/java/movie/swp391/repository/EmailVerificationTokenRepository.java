package movie.swp391.repository;

import movie.swp391.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByToken(String token);
    Optional<EmailVerificationToken> findByEmail(String email);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM EmailVerificationToken t WHERE t.account.accountID = :accountId")
    void deleteByAccountId(@Param("accountId") Integer accountId);

    @Modifying
    @Transactional
    @Query("DELETE FROM EmailVerificationToken t WHERE t.email = :email")
    void deleteByEmail(@Param("email") String email);
} 