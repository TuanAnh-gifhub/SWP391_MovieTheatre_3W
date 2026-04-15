package movie.swp391.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoyaltyRuleResponse {
    Integer id;
    Double amountMoney;
    Integer pointsEarn;
    Double returnMoney;
    Boolean isActive;

}
