package movie.swp391.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieShowtimeResponse {
    private Integer movieId;
    private String title;
    private String poster;
    private String version;
    private List<ShowtimeInfo> showtimes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShowtimeInfo {
        private Integer showtimeId;
        private LocalTime time;
        private String cinemaRoomName;
    }
} 