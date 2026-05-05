package movie.swp391.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ShowTimeV1Response {
    String cityName;
    List<CinemaDTO> cinemas;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CinemaDTO {
        Integer cinemaID;
        String name;
        List<CinemaRoomDTO> cinemaRooms;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CinemaRoomDTO {
        Integer cinemaRoomID;
        String roomName;
        List<DateShowtimeDTO> showtimes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DateShowtimeDTO {

        LocalDate date;
        List<TimeWithMovieTitleDTO> times;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TimeWithMovieTitleDTO {
        Integer showtimeID;
        LocalTime time;
        String movieTitle;
        String movieId;
        String version;
        Boolean active;
        LocalTime toTime;
    }
}

