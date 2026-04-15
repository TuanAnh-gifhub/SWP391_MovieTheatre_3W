package movie.swp391.repository;

import jakarta.validation.constraints.NotNull;
import movie.swp391.entity.MovieStatusPeriod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface MovieStatusPeriodRepository extends JpaRepository<MovieStatusPeriod, Long> {
    boolean existsMovieStatusPeriodByFromDateAndToDate(@NotNull LocalDate fromDate, @NotNull LocalDate toDate);

    Optional<Object> findFirstByOrderByIdAsc();

    Optional<MovieStatusPeriod> findByFromDateAndToDate(@NotNull LocalDate fromDate, @NotNull LocalDate toDate);
}