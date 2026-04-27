package movie.swp391.serviceImp;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.Customer;
import movie.swp391.entity.FavoriteMovie;
import movie.swp391.entity.Movie;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.mapper.MovieFavoriteMapper;
import movie.swp391.repository.CustomerRepository;
import movie.swp391.repository.FavoriteMovieRepository;
import movie.swp391.repository.MovieRepository;
import movie.swp391.request.FavoriteMovieRequest;
import movie.swp391.response.FavoriteMovieResponse;
import movie.swp391.service.MovieFavoriteService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class MovieFavoriteServiceImpl implements MovieFavoriteService {

    MovieRepository movieRepository;
    CustomerRepository customerRepository;
    FavoriteMovieRepository favoriteMovieRepository;
    MovieFavoriteMapper movieFavoriteMapper;

    public String favoriteMovie(FavoriteMovieRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId()).orElseThrow(() -> new AppException(ErrorHandler.MOVIE_NOT_EXISTED));
        Customer  customer = customerRepository.findById(request.getCustomerId()).orElseThrow(() -> new AppException(ErrorHandler.CUSTOMER_NOT_FOUND));
        FavoriteMovie favoriteMoviee = favoriteMovieRepository.findFavoriteMovieByMovieAndCustomer(movie, customer);
        if(favoriteMovieRepository.existsByMovieAndCustomer(movie, customer)) {
            favoriteMovieRepository.deleteById(favoriteMoviee.getId());
            return "Đã tắt thành công";

        }

        FavoriteMovie favoriteMovie = movieFavoriteMapper.toFavoriteMovie(request);
        favoriteMovieRepository.save(favoriteMovie);
        return "Đã yêu thích thành công";
    }


    public List<FavoriteMovieResponse> showTime(Integer customerId) {
        List<Movie> favoriteMovie = favoriteMovieRepository.findMovieByCustomer_CustomerID(customerId);
        return favoriteMovie.stream().map(movie -> FavoriteMovieResponse.builder()
                .movieId(movie.getMovieID())
                .poster(movie.getPoster())
                .movieTitle((movie.getTitle()))
                .build())
                .toList();


    }



}
