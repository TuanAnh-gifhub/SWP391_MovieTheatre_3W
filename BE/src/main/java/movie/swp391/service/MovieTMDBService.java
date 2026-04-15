package movie.swp391.service;

import movie.swp391.request.MovieRequest;
import movie.swp391.response.MovieTMDBSearchResponse;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

public interface MovieTMDBService {

     @PreAuthorize("hasRole('ADMIN')")
     List<MovieTMDBSearchResponse> searchMoviesTMDB(String search);

     MovieRequest getMovieDetails(Integer movieId);
     void importMoviesFromTMDB();






}
