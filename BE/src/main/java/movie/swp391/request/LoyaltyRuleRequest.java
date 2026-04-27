package movie.swp391.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoyaltyRuleRequest {
    Double amountMoney;
    Integer pointsEarn;
    Double returnMoney;

}
