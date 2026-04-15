// PromotionGroupAssignRequest.java
package movie.swp391.request.promotion;

import lombok.Data;

import java.util.List;

@Data
public class PromotionGroupAssignRequest {
    private List<Integer> promotionIds;  // ✅ Danh sách promotion
    private Integer groupId;             // ✅ groupId đúng kiểu camelCase
}

