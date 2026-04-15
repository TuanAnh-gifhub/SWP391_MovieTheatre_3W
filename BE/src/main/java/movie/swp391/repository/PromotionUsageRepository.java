package movie.swp391.repository;

import movie.swp391.entity.Customer;
import movie.swp391.entity.Promotion;
import movie.swp391.entity.PromotionUsage;
import movie.swp391.entity.PromotionUsageKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, PromotionUsageKey> {
    Optional<PromotionUsage> findByPromotionAndCustomer(Promotion promotion, Customer customer);
}

