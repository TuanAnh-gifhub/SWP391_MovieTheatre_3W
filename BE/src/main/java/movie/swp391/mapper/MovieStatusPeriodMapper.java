package movie.swp391.mapper;


import movie.swp391.entity.MovieStatusPeriod;
import movie.swp391.request.MovieStatusPeriodRequest;
import movie.swp391.response.MovieStatusPeriodResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface MovieStatusPeriodMapper {

    MovieStatusPeriodResponse toMovieStatusPeriodResponse(MovieStatusPeriod msp);

    MovieStatusPeriod toMovieStatusPeriod(MovieStatusPeriodRequest request);


    void updateMovieStatusPeriod(@MappingTarget MovieStatusPeriod msp, MovieStatusPeriodRequest request);

}