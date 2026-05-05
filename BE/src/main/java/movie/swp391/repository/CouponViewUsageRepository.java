package movie.swp391.repository;

import movie.swp391.entity.Coupon;
import movie.swp391.entity.CouponViewUsage;
import movie.swp391.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponViewUsageRepository extends JpaRepository<CouponViewUsage, Integer> {

    boolean existsByCustomerAndCoupon(Customer customer, Coupon coupon);


    boolean existsByCustomer_CustomerIDAndCoupon(Integer customerCustomerID, Coupon coupon);

    List<CouponViewUsage> findByCustomer_CustomerIDOrderByViewedAtDesc(Integer customerId);

    void deleteAllByCoupon(Coupon coupon);
}