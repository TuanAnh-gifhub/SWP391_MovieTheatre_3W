package movie.swp391.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.request.MovieRequest;
import movie.swp391.response.ApiResponse;
import movie.swp391.response.MovieTMDBSearchResponse;
import movie.swp391.service.MovieTMDBService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/movieTMDB")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class MovieTMDBController {

    MovieTMDBService movieTMDBService;


    @GetMapping("/search")
    public ApiResponse<List<MovieTMDBSearchResponse>> searchMovies(@RequestParam("name") String name) {
        return ApiResponse.<List<MovieTMDBSearchResponse>>builder()
                .result(movieTMDBService.searchMoviesTMDB(name))
                .message("Success")
                .status(200)
                .build();
    }

    @GetMapping("/search-detail/{movieId}")
    public ApiResponse<MovieRequest> searchDetailMovie(@PathVariable Integer movieId) {
        return ApiResponse.<MovieRequest>builder()
                .result(movieTMDBService.getMovieDetails(movieId))
                .message("Success")
                .status(200)
                .build();
    }








}


