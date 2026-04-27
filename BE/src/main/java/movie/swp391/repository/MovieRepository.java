package movie.swp391.repository;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import movie.swp391.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Integer> {
    boolean existsMoviesByActorsAndVersion(@Size(max = 255) String actors, @Size(max = 10) String version);

    boolean existsMoviesByTitleAndVersion(@NotBlank(message = "Title is required") @Size(max = 100) String title, @Size(max = 10) String version);

    boolean existsMoviesByTitleAndVersionAndMovieIDNot(@NotBlank(message = "Title is required") @Size(max = 100) String title, @Size(max = 10) String version, Integer movieID);

    List<Movie> findByMovieStatusPeriod_Id(Long movieStatusPeriodId);

    @Query("SELECT m.movieStatusPeriod.fromDate FROM Movie m WHERE m.movieID = :movieId")
    LocalDate findMovieStatusPeriod_fromDateByMovieID(@Param("movieId") Integer movieId);

    @Query("SELECT m.movieStatusPeriod.toDate FROM Movie m WHERE m.movieID = :movieId")
    LocalDate findMovieStatusPeriod_toDateByMovieID(@Param("movieId") Integer movieId);

    @Query("SELECT m.runningTime FROM Movie m WHERE m.movieID = :movieID")
    Integer findRunningTimeByMovieID(@Param("movieID") Integer movieID);

    boolean existsMoviesByTitleAndPoster(@NotBlank(message = "Title is required") @Size(max = 100) String title, @Size(max = 255) String poster);

    List<Movie> findByVersion(@Size(max = 10) String version);

    List<Movie> findByGenre(@Size(max = 50) String genre);

    boolean existsMoviesByTitleAndPosterAndMovieIDNot(String title, String version, Integer movieId);

    List<Movie> findByAutoGenre(String autoGenre);
}