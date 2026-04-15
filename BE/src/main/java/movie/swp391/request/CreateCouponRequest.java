package movie.swp391.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import movie.swp391.constant.DiscountType;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)


public class CreateCouponRequest {
     String name;
     String code;
     DiscountType discountType;
     Double discountValue;
     int usageLimit;
     LocalDateTime expirationDate;

}
