package movie.swp391.repository;

import jakarta.validation.constraints.NotBlank;
import movie.swp391.entity.LoyaltyTier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoyaltyTierRepository extends JpaRepository<LoyaltyTier, Integer> {
  boolean existsByNameIgnoreCase(@NotBlank String name);

  List<LoyaltyTier> findAllByIsActiveTrue();
}