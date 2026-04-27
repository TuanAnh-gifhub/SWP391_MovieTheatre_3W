package movie.swp391.response.promotion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import movie.swp391.request.promotion.PromotionDto;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionGroupResponse {
    private Integer id;
    private String groupCode;
    private String description;
    private List<PromotionDto> promotions;
}

