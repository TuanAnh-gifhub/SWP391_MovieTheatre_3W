package movie.swp391.repository;

import movie.swp391.entity.ExportMovieDate;
import movie.swp391.entity.Movie;
import movie.swp391.response.ExportMovieDateSummaryResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExportMovieDateRepository extends JpaRepository<ExportMovieDate, Integer> {
    Optional<ExportMovieDate> findByMovieAndExportDate(Movie movie, LocalDate date);

    @Query("SELECT new movie.swp391.response.ExportMovieDateSummaryResponse(" +
            "e.movie.movieID, e.movie.title, e.exportDate, " +
            "SUM(e.totalMoney), " +
            "SUM(e.totalMoneyWithoutFoodAndDiscount), " +
            "SUM(e.totalMoneyDiscount), " +
            "SUM(e.totalMoneyFood), " +
            "SUM(e.seller), " +
            "SUM(e.buyFromScoresToMoney)) " +
            "FROM ExportMovieDate e " +
            "GROUP BY e.movie.movieID, e.movie.title, e.exportDate " +
            "ORDER BY e.exportDate DESC, e.movie.movieID")
    List<ExportMovieDateSummaryResponse> summarizeByMovieAndDate();

}

