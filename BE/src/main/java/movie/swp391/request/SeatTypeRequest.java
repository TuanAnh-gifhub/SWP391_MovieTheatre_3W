package movie.swp391.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SeatTypeRequest {

    @NotBlank(message = "Seat type code is required")
    @Size(max = 50, message = "Seat type code must be less than 50 characters")
    String code;

    @NotBlank(message = "Seat type name is required")
    @Size(max = 100, message = "Seat type name must be less than 100 characters")
    String name;

    @Size(max = 255, message = "Seat type description must be less than 255 characters")
    String description;

    @DecimalMin(value = "0.0", inclusive = true, message = "Base price must be zero or positive")
    Double basePrice;

    Boolean active;
    Integer sortOrder;
}

