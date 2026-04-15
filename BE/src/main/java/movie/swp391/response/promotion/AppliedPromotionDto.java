package movie.swp391.response.promotion;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class AppliedPromotionDto {
    private Integer promotionId;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private double value;
    private String detail;
    private double discountAmount;
    private Double maxDiscountAmount;
    private String image;
    private Boolean isExclusive;
    private String groupCode;
    private String promotionType;
    private String status;
    private Map<String, Object> condition;



}
