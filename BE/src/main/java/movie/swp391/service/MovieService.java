package movie.swp391.service;

import movie.swp391.request.MovieAutoRequest;
import movie.swp391.request.MovieRequest;
import movie.swp391.request.MovieStatusPeriodRequest;
import movie.swp391.response.*;
import movie.swp391.response.MovieResponse;
import movie.swp391.response.MovieStatusPeriodResponse;

import java.util.List;

public interface MovieService {

     List<MovieResponse> getAllMovies();
     MovieResponse createMovie(MovieRequest request);
     MovieResponse updateMovie(Integer movieId,MovieRequest request);
     void deleteMovie(Integer movieId);

     List<MovieStatusPeriodResponse> getALlDate();

     MovieStatusPeriodResponse createDate(MovieStatusPeriodRequest request);
     MovieStatusPeriodResponse updateDate(Long id,MovieStatusPeriodRequest request);
     void deleteDate(Long id);
     void turnOnOffMovie(List<Integer> movieId);
     void setDateForMovie(List<Integer> movieId, Long id );

     void syncMovieStatusPeriodByShowtimes(Integer movieId);

     MovieResponse createAutoMovie(MovieAutoRequest request);









}

