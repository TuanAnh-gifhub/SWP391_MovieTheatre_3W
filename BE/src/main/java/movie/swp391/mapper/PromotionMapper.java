package movie.swp391.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import movie.swp391.entity.Promotion;
import movie.swp391.request.promotion.PromotionCreateDto;
import movie.swp391.request.promotion.PromotionDto;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

@Mapper(componentModel = "spring")
public abstract class PromotionMapper {

    @Autowired
    protected ObjectMapper objectMapper;

    // Promotion -> PromotionDto
    @Mapping(target = "condition", expression = "java(toConditionMap(promotion.getCondition()))")
    @Mapping(target = "promotionId", source = "promotionID")
    @Mapping(target = "groupCode", expression = "java(promotion.getGroup() != null ? promotion.getGroup().getGroupCode() : null)")
    public abstract PromotionDto toPromotionDto(Promotion promotion);

    public abstract List<PromotionDto> toPromotionDtos(List<Promotion> promotions);

    // PromotionCreateDto -> Promotion
    @Mapping(target = "promotionID", ignore = true)
    @Mapping(target = "condition", expression = "java(toConditionString(dto.getCondition()))")
    public abstract Promotion toEntity(PromotionCreateDto dto);

    // PromotionDto -> Promotion (dùng nếu muốn update)
    @Mapping(target = "condition", expression = "java(toConditionString(dto.getCondition()))")
    public abstract Promotion toEntity(PromotionDto dto);

    // Helpers

    public String toConditionString(Map<String, Object> map) {
        try {
            return map != null ? objectMapper.writeValueAsString(map) : null;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Invalid condition map", e);
        }
    }

    public Map<String, Object> toConditionMap(String json) {
        try {
            return json != null ? objectMapper.readValue(json, Map.class) : null;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Invalid condition json", e);
        }
    }
}
