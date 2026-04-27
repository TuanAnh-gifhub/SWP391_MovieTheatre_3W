package movie.swp391.serviceImp;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.constant.DiscountType;
import movie.swp391.entity.*;
import movie.swp391.entity.Coupon;
import movie.swp391.entity.CouponViewUsage;
import movie.swp391.entity.Customer;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.repository.CouponRepository;
import movie.swp391.repository.CouponUsageRepository;
import movie.swp391.repository.CouponViewUsageRepository;
import movie.swp391.repository.CustomerRepository;
import movie.swp391.request.*;
import movie.swp391.request.ApplyCouponRequest;
import movie.swp391.request.CreateCouponRequest;
import movie.swp391.response.ApplyCouponResponse;
import movie.swp391.service.CouponService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class CouponServiceImpl implements CouponService {

     CouponRepository couponRepository;
     CustomerRepository customerRepository;
     CouponUsageRepository couponUsageRepository;
     CouponViewUsageRepository couponViewUsageRepository;


    public Coupon createCoupon(CreateCouponRequest request) {
        // Kiểm tra code đã tồn tại
        if (couponRepository.existsByCode(request.getCode())) {
            throw new AppException(ErrorHandler.COUPON_CODE_ALREADY_EXISTS, "Mã coupon đã tồn tại.");
        }

        Coupon coupon = new Coupon();
        coupon.setName(request.getName());
        coupon.setCode(request.getCode());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setUsedCount(0);
        coupon.setExpirationDate(request.getExpirationDate());
        coupon.setIsActive(true);
        coupon.setCreatedAt(LocalDateTime.now());

        return couponRepository.save(coupon);
    }


    public ApplyCouponResponse applyCoupon(ApplyCouponRequest request) {
        Coupon coupon = (Coupon) couponRepository.findByCode(request.getCode())
                .orElseThrow(() -> new AppException(ErrorHandler.COUPON_NOT_FOUND, "Mã coupon không tồn tại."));

        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            throw new AppException(ErrorHandler.COUPON_INACTIVE, "Mã coupon không hoạt động.");
        }

        if (coupon.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorHandler.COUPON_EXPIRED, "Mã coupon đã hết hạn.");
        }




        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorHandler.CUSTOMER_NOT_FOUND, "Khách hàng không tồn tại."));

        // Kiểm tra đã sử dụng coupon này chưa
        boolean used = couponUsageRepository.existsByCustomerAndCoupon(customer, coupon);
        if (used) {
            throw new AppException(ErrorHandler.COUPON_ALREADY_USED, "Bạn đã sử dụng mã này rồi.");
        }

        boolean couponViewUsage = couponViewUsageRepository.existsByCustomer_CustomerIDAndCoupon(request.getCustomerId(),coupon) || !coupon.getIsGame();
        if (!couponViewUsage) throw new AppException(ErrorHandler.COUPON_NOT_FOUND, "Mã coupon này không dành cho bạn");


        double discountAmount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discountAmount = request.getOrderTotal() * (coupon.getDiscountValue() / 100.0);
        } else {
            discountAmount = coupon.getDiscountValue();
        }

        if (discountAmount > request.getOrderTotal()) {
            discountAmount = request.getOrderTotal();
        }

        double finalTotal = request.getOrderTotal() - discountAmount;

            if (coupon.getUsageLimit() <= 0) {
                throw new AppException(ErrorHandler.COUPON_LIMIT_REACHED, "Mã coupon đã đạt giới hạn sử dụng.");
            }

        return ApplyCouponResponse.builder()
                .discountAmount(discountAmount)
                .finalTotal(finalTotal)
                .message("Mã giảm giá áp dụng thành công.")
                .discountRate(coupon.getDiscountValue())
                .couponType(coupon.getDiscountType())
                .build();
    }
    @Override
    public void turnOnOffCoupon(List<Integer> couponIds) {
        List<Coupon> coupons = couponRepository.findAllById(couponIds);

        for (Coupon coupon : coupons) {
            coupon.setIsActive(!coupon.getIsActive());

        }

        couponRepository.saveAll(coupons);
    }

    @Override
    public List<Coupon> viewAllCoupons() {
        return couponRepository.findAll();
    }



    @Override
    public void turnIsGame(Integer couponId){
        Coupon coupon = couponRepository.findById(couponId).orElseThrow(() -> new AppException(ErrorHandler.COUPON_NOT_FOUND));
        coupon.setIsGame(!coupon.getIsGame());
        couponRepository.save(coupon);
    }
    @Override
    public Coupon randomGameCoupon(Integer customerId){
        List<Coupon> coupons = couponRepository.findByIsGameTrueAndExpirationDateAfterAndUsageLimitGreaterThan(LocalDateTime.now(), 0);
        Customer customer = customerRepository.findById(customerId).orElseThrow(() -> new AppException(ErrorHandler.CUSTOMER_NOT_FOUND));
        int randomIndex = ThreadLocalRandom.current().nextInt(coupons.size());

        boolean viewUsed = couponViewUsageRepository.existsByCustomerAndCoupon(customer, coupons.get(randomIndex));
        if (viewUsed) {throw new AppException(ErrorHandler.COUPON_ALREADY_USED, "bạn đang hack à");}
        CouponViewUsage couponViewUsage = new CouponViewUsage();
        couponViewUsage.setCustomer(customer);
        couponViewUsage.setCoupon(coupons.get(randomIndex));
        couponViewUsageRepository.save(couponViewUsage);
        customer.setIsGamePlayed(true);
        customer.setDateGameCheck(LocalDateTime.now());
        customerRepository.save(customer);
        if (coupons.isEmpty()) {
            throw new AppException(ErrorHandler.LIST_EMPTY, "Không có bất kì mã nào hiện tại");
        }


        return coupons.get(randomIndex);
    }
    @Override
    @Transactional
    public void deleteCoupon(Integer couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new AppException(ErrorHandler.COUPON_NOT_FOUND, "Coupon không tồn tại."));

        // Xóa các usage liên quan
        couponUsageRepository.deleteAllByCoupon(coupon);
        couponViewUsageRepository.deleteAllByCoupon(coupon);

        // Sau đó mới xóa coupon
        couponRepository.delete(coupon);
    }
    @Scheduled(cron = "0 0 0 * * *")
    public void autoResetGameCheck() {
        List<Customer> customers = customerRepository.findAll();
        List<CouponViewUsage> couponViewUsages = couponViewUsageRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (CouponViewUsage couponViewUsage : couponViewUsages) {
            if (now.isAfter(couponViewUsage.getViewedAt().plusMonths(1))){
                couponViewUsageRepository.delete(couponViewUsage);
            }

        }



        if (customers.isEmpty()) throw new AppException(ErrorHandler.LIST_EMPTY);

        for (Customer customer : customers) {
            if (customer.getDateGameCheck() != null) {

                if (now.isAfter(customer.getDateGameCheck().plusMonths(1))) {
                    customer.setIsGamePlayed(false);
                    customer.setDateGameCheck(null);
                }
            }
        }

        customerRepository.saveAll(customers);
    }

    



}


