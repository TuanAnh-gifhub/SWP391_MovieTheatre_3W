package movie.swp391.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.request.FavoriteMovieRequest;
import movie.swp391.response.ApiResponse;
import movie.swp391.response.FavoriteMovieResponse;
import movie.swp391.service.MemberService;
import movie.swp391.service.MovieFavoriteService;
import movie.swp391.service.MovieService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/movie")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class FavoriteMovieController {

    MemberService memberService;
    MovieService movieService;
    MovieFavoriteService movieFavoriteService;




    @PostMapping("/favorite-movie")
    public ApiResponse<String> favoriteMovie(@RequestBody @Valid FavoriteMovieRequest request) {
        return ApiResponse.<String>builder()
                .result(movieFavoriteService.favoriteMovie(request))
                .message("Success")
                .status(200)
                .build();
    }
    @GetMapping("/view-favorite-movie/{customerId}")
    public ApiResponse<List<FavoriteMovieResponse>> favoriteMovie(@PathVariable Integer customerId) {
        return ApiResponse.<List<FavoriteMovieResponse>>builder()
                .result(movieFavoriteService.showTime(customerId))
                .message("Success")
                .status(200)
                .build();
    }





}


