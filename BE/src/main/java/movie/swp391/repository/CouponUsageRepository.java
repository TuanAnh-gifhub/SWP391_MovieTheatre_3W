package movie.swp391.repository;

import movie.swp391.entity.CouponUsage;
import movie.swp391.entity.Coupon;
import movie.swp391.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Integer> {
    void deleteAllByCoupon(Coupon coupon);
    boolean existsByCustomerAndCoupon(Customer customer, Coupon coupon);
}