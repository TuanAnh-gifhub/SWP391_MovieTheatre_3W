package movie.swp391.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)


public class LoyaltyTierResponse {
     Integer id;
     String name;
     Integer pointThreshold;
     Double discountPercent;
     Boolean isActive;
     String rankLink;
     LocalDateTime createdAt;
     LocalDateTime updatedAt;
}