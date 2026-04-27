package movie.swp391.response.promotion;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionResponse {

    private Integer promotionId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;

    @NotNull(message = "Promotion value is required")
    @Positive(message = "Promotion value must be greater than zero")
    private Double value;

    private Double maxDiscountAmount;

    @NotBlank(message = "Detail is required")
    private String detail;

    @NotBlank(message = "Image is required")
    private String image;

    private Boolean isExclusive;

    private String groupCode;

    @NotBlank(message = "Promotion type is required")
    private String promotionType;

    private Integer maxTotalUsage;
    private Integer maxUsagePerCustomer;

    @Valid
    // PromotionDto.java
    private Map<String, Object> condition;


    @NotBlank(message = "Status cannot be blank")
    private String status = "ACTIVE";
}
