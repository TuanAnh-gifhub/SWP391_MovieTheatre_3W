package movie.swp391.mapper;


import movie.swp391.entity.FavoriteMovie;
import movie.swp391.request.FavoriteMovieRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface MovieFavoriteMapper {
    @Mapping(target = "movie.movieID", source = "movieId")
    @Mapping(target = "customer.customerID", source = "customerId")
    FavoriteMovie toFavoriteMovie(FavoriteMovieRequest request);
}