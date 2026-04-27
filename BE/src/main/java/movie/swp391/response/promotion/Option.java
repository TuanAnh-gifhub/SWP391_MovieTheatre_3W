package movie.swp391.response.promotion;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Option {
    private String label;
    private Object value;

    public Option(String label, Object value) {
        this.label = label;
        this.value = value;
    }
}
