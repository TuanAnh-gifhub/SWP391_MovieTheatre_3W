package movie.swp391.repository;

import movie.swp391.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Integer> {

  boolean existsByCode(String code);

  Optional<Object> findByCode(String code);

    List<Coupon> findByIsGameTrue();

    List<Coupon> findByIsGameTrueAndExpirationDateAfter(LocalDateTime now);


  List<Coupon> findByIsGameTrueAndExpirationDateAfterAndUsageLimitGreaterThan(LocalDateTime now, int i);
}