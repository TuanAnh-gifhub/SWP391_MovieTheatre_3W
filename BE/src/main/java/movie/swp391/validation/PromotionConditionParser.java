package movie.swp391.validation; // hoặc package bạn chọn

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class PromotionConditionParser {
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> parse(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}
