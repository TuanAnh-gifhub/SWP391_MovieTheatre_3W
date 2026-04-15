package movie.swp391.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetAccountActiveStatusRequest {
    @NotNull(message = "Active status is required")
    private Boolean active;
}