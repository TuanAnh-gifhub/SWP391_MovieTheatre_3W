package movie.swp391.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SeatTypeResponse {
    Integer seatTypeID;
    String code;
    String name;
    String description;
    Double basePrice;
    Boolean active;
    Integer sortOrder;
    Long seatCount;
}

