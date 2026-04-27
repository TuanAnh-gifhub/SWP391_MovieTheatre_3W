package movie.swp391.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.request.MovieRequest;
import movie.swp391.request.MovieStatusPeriodRequest;
import movie.swp391.response.*;
import movie.swp391.response.ApiResponse;
import movie.swp391.response.MovieResponse;
import movie.swp391.response.MovieStatusPeriodResponse;
import movie.swp391.service.MemberService;
import movie.swp391.service.MovieService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/movie")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class MovieController {

    MemberService memberService;
    MovieService movieService;



    @GetMapping("/view-all-movies")
    public ApiResponse<List<MovieResponse>> getAllMovies() {
        return ApiResponse.<List<MovieResponse>>builder()
                .result(movieService.getAllMovies())
                .message("Success")
                .status(200)
                .build();
    }
    @PostMapping("/create-movie")
    public ApiResponse<MovieResponse> createMovie(@RequestBody @Valid MovieRequest request) {
        return ApiResponse.<MovieResponse>builder()
                .result(movieService.createMovie(request))
                .message("Success")
                .status(200)
                .build();
    }

    @PutMapping("/update-movie/{movieId}")
    public ApiResponse<MovieResponse> updateMovie(@PathVariable Integer movieId,@RequestBody @Valid MovieRequest request) {
        return ApiResponse.<MovieResponse>builder()
                .result(movieService.updateMovie(movieId,request))
                .message("Success")
                .status(200)
                .build();
    }
    @DeleteMapping("/delete-movie/{movieId}")
    public ApiResponse<String> deleteMovie(@PathVariable Integer movieId) {
        movieService.deleteMovie(movieId);
        return ApiResponse.<String>builder()
                .result("Movie has been deleted")
                .message("S")
                .build();
    }
    @GetMapping("/view-all-dates-for-movie")
    public ApiResponse<List<MovieStatusPeriodResponse>> getAllDatesForMovie() {
        return ApiResponse.<List<MovieStatusPeriodResponse>>builder()
                .result(movieService.getALlDate())
                .message("Success")
                .status(200)
                .build();
    }
    @PostMapping("/create-date-show")
    public ApiResponse<MovieStatusPeriodResponse> createDate(@RequestBody @Valid MovieStatusPeriodRequest request) {
        return ApiResponse.<MovieStatusPeriodResponse>builder()
                .result(movieService.createDate(request))
                .message("Success")
                .status(200)
                .build();
    }

    @PutMapping("/update-date-show/{id}")
    public ApiResponse<MovieStatusPeriodResponse> updateDate(@PathVariable Long id, @RequestBody @Valid MovieStatusPeriodRequest request) {
        return ApiResponse.<MovieStatusPeriodResponse>builder()
                .result(movieService.updateDate(id,request))
                .message("Success")
                .status(200)
                .build();
    }
    @DeleteMapping("/delete-date/{id}")
    public ApiResponse<String> deleteMovie(@PathVariable Long id) {
        movieService.deleteDate(id);
        return ApiResponse.<String>builder()
                .result("Date has been deleted")
                .message("Success")
                .build();
    }
    @PutMapping("/on-off-movie")
    public ApiResponse<String> onOffMovie(@RequestBody List<Integer> movieIds) {
        movieService.turnOnOffMovie(movieIds);
        return ApiResponse.<String>builder()
                .result("Cập nhật thành công")
                .message("Success")
                .build();
    }
    @PutMapping("/set-date-movie/{id}")
    public ApiResponse<String> setDateMovie(@RequestBody List<Integer> movieIds, @PathVariable Long id) {
        movieService.setDateForMovie(movieIds, id);
        return ApiResponse.<String>builder()
                .result("Cập nhật ngày thành công")
                .message("Success")
                .build();
    }


}



