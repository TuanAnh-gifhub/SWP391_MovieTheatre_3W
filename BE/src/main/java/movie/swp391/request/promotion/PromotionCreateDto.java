package movie.swp391.request.promotion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionCreateDto {
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String detail;
    private Double value;
    private String image;
    private Boolean isExclusive;
    private String promotionType;
    private Double maxDiscountAmount;
    private Integer maxTotalUsage;
    private Integer maxUsagePerCustomer;
    private Map<String, Object> condition;

}
