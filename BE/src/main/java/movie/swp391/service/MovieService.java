package movie.swp391.service;

import movie.swp391.request.MovieAutoRequest;
import movie.swp391.request.MovieRequest;
import movie.swp391.request.MovieStatusPeriodRequest;
import movie.swp391.response.*;
import movie.swp391.response.MovieResponse;
import movie.swp391.response.MovieStatusPeriodResponse;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

public interface MovieService {

     @PreAuthorize("permitAll()")
     List<MovieResponse> getAllMovies();
     MovieResponse createMovie(MovieRequest request);
     MovieResponse updateMovie(Integer movieId,MovieRequest request);
     void deleteMovie(Integer movieId);

     List<MovieStatusPeriodResponse> getALlDate();

     MovieStatusPeriodResponse createDate(MovieStatusPeriodRequest request);
     MovieStatusPeriodResponse updateDate(Long id,MovieStatusPeriodRequest request);
     @PreAuthorize("hasRole('ADMIN')")
     void deleteDate(Long id);
     @PreAuthorize("hasRole('ADMIN')")
     void turnOnOffMovie(List<Integer> movieId);
     @PreAuthorize("hasRole('ADMIN')")
     void setDateForMovie(List<Integer> movieId, Long id );

     MovieResponse createAutoMovie(MovieAutoRequest request);









}

