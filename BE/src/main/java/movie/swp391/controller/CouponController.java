package movie.swp391.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.Coupon;
import movie.swp391.request.ApplyCouponRequest;
import movie.swp391.request.CreateCouponRequest;
import movie.swp391.response.ApiResponse;
import movie.swp391.response.ApplyCouponResponse;
import movie.swp391.service.CouponService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/coupon")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CouponController {

    CouponService couponService;


    @PostMapping("/create-coupon")
    public ApiResponse<Coupon> createCoupon(@RequestBody @Valid CreateCouponRequest request) {
        return ApiResponse.<Coupon>builder()
                .result(couponService.createCoupon(request))
                .message("Success")
                .status(200)
                .build();
    }

    @PostMapping("/apply")
    public ApiResponse<ApplyCouponResponse> applyCoupon(@RequestBody @Valid ApplyCouponRequest request) {
        return ApiResponse.<ApplyCouponResponse>builder()
                .result(couponService.applyCoupon(request))
                .message("Success")
                .status(200)
                .build();



    }
    @PutMapping("/on-off-coupon")
    public ApiResponse<String> onOffCoupon(@RequestBody List<Integer> couponIds) {
        couponService.turnOnOffCoupon(couponIds);
        return ApiResponse.<String>builder()
                .result("Cập nhật thành công")
                .message("Success")
                .build();
    }
    @GetMapping("/view-all")
    public ApiResponse<List<Coupon>> getAllCoupon() {
        return ApiResponse.<List<Coupon>>builder()
                .result(couponService.viewAllCoupons())
                .message("Success")
                .status(200)
                .build();


    }

    @PutMapping("/choose-coupon-game")
    public ApiResponse<String> chooseGameCoupon(@RequestBody Integer couponId) {
        couponService.turnIsGame(couponId);
        return ApiResponse.<String>builder()
                .result("Cập nhật thành công")
                .message("Success")
                .status(200)
                .build();


    }

    @GetMapping("/random-coupon-for-game/{customerId}")
    public ApiResponse<Coupon> randomGameCoupon(@PathVariable Integer customerId) {
        return ApiResponse.<Coupon>builder()
                .result(couponService.randomGameCoupon(customerId))
                .message("Success")
                .status(200)
                .build();


    }

    @DeleteMapping("/delete/{couponId}")
    public ApiResponse<String> deleteCoupon(@PathVariable Integer couponId) {
        couponService.deleteCoupon(couponId);
        return ApiResponse.<String>builder()
                .result("Xóa coupon thành công")
                .message("Success")
                .status(200)
                .build();
    }
}


