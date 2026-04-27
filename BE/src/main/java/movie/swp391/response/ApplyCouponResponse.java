package movie.swp391.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import movie.swp391.constant.DiscountType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplyCouponResponse {
    Double discountAmount;
    Double finalTotal;
    Double discountRate;
    DiscountType couponType;
    String message;
}