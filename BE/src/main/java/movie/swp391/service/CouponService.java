package movie.swp391.service;

import movie.swp391.entity.Coupon;
import movie.swp391.request.ApplyCouponRequest;
import movie.swp391.request.CreateCouponRequest;
import movie.swp391.response.ApplyCouponResponse;

import java.util.List;

public interface CouponService {
    Coupon createCoupon(CreateCouponRequest request);
    ApplyCouponResponse applyCoupon(ApplyCouponRequest request);
    void turnOnOffCoupon(List<Integer> couponIds);
    List<Coupon> viewAllCoupons();
    void turnIsGame(Integer couponId);
    Coupon randomGameCoupon(Integer customerId);
    void deleteCoupon(Integer couponId);
}
