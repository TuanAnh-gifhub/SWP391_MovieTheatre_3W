package movie.swp391.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)


public class MovieAutoRequest {
    String title;
    String actors;
    String director;
    String productionCompany;
    String runningTime;
    String version;
    String trailer;
    String content;
    String poster;
    String genre;
    String language;
    String ageRating;
    LocalDate releaseDate;
    LocalDate fromDate;
    LocalDate toDate;
    String autoGenre;
}
