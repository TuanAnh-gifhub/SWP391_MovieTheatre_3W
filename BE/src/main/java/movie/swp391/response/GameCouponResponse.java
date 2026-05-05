package movie.swp391.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import movie.swp391.constant.DiscountType;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameCouponResponse {
    private Integer couponId;
    private String name;
    private String code;
    private DiscountType discountType;
    private Double discountValue;
    private LocalDateTime expirationDate;
    private Boolean active;
    private LocalDateTime receivedAt;
    private Boolean used;
    private String status;
}

