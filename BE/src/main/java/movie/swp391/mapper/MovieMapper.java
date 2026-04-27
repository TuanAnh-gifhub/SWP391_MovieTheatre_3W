package movie.swp391.mapper;


import movie.swp391.entity.Movie;
import movie.swp391.request.MovieAutoRequest;
import movie.swp391.request.MovieRequest;
import movie.swp391.response.MovieResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface MovieMapper {
    @Mapping(target = "fromDate", source = "movieStatusPeriod.fromDate")
    @Mapping(target = "toDate", source = "movieStatusPeriod.toDate")
    @Mapping(target = "status", source = "movieStatusPeriod.status")
    MovieResponse toMovieResponse(Movie movie);

    Movie toMovie(MovieRequest request);

    Movie toMovieAuto(MovieAutoRequest request);

    @Mapping(target = "movieStatusPeriod", ignore = true)
    void updateMovie(@MappingTarget Movie movie, MovieRequest movieRequest);

}