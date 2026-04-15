package movie.swp391.response.promotion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConditionResponse {
    private String key;
    private String displayName;
    private String inputType;
    private List<Option> options;

}
