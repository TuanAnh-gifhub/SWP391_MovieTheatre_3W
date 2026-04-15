package movie.swp391.repository;

import movie.swp391.entity.LoyaltyRule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoyaltyRuleRepository extends JpaRepository<LoyaltyRule, Integer> {
    boolean existsByIsActiveTrue();

    LoyaltyRule findByIsActive(Boolean isActive);
}
