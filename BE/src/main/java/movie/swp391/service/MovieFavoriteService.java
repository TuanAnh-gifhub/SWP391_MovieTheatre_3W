package movie.swp391.service;

import movie.swp391.request.FavoriteMovieRequest;
import movie.swp391.response.*;
import movie.swp391.response.FavoriteMovieResponse;

import java.util.List;

public interface MovieFavoriteService {
    String favoriteMovie(FavoriteMovieRequest request);
    List<FavoriteMovieResponse> showTime(Integer customerId);



} 
