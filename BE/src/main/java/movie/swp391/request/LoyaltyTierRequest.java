package movie.swp391.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)


public class LoyaltyTierRequest {
     @NotBlank
      String name;

     @NotNull
      Integer pointThreshold;

     @NotNull
     @Min(0)
     @Max(100)
      Double discountPercent;

     String rankLink;
}