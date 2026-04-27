package movie.swp391.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)

public class ViewScoreHistoryResponse {
   Integer scoreID;
   LocalDateTime dateCreate;
   String movieName;
   String actionType;
   Integer amount;


}
