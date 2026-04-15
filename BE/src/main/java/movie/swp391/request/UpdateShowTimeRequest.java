package movie.swp391.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)


public class UpdateShowTimeRequest {
    private Integer showtimeId;
    private Integer movieId;
    private Integer cinemaRoomId;
    private LocalDate date;
    private LocalTime time;
    private String version;
}