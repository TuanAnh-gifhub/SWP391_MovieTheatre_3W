package movie.swp391.repository;

import movie.swp391.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
	Optional<PaymentMethod> findByTypeIgnoreCase(String type);
}