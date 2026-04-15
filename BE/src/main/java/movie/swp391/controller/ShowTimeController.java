package movie.swp391.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.request.CreateShowTImeRequest;
import movie.swp391.request.SuggestTimeRequest;
import movie.swp391.request.UpdateShowTimeRequest;
import movie.swp391.response.*;
import movie.swp391.response.*;
import movie.swp391.service.MemberService;
import movie.swp391.service.MovieService;
import movie.swp391.service.ShowTimeService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/showtime")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class ShowTimeController {

    MemberService memberService;
    MovieService movieService;
   ShowTimeService showService;


    @GetMapping("/view-date-create-showtime")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_SHOWTIME')")
    public ApiResponse<List<LocalDate>> getAllDate(Integer movieId) {
        return ApiResponse.<List<LocalDate>>builder()
                .result(showService.searchDateByMovieId(movieId))
                .message("Success")
                .status(200)
                .build();
    }
    @GetMapping("/view-cinema-create-showtime")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_SHOWTIME')")
    public ApiResponse<List<String>> getAllCinemaByMovieIdAndDate(@RequestBody Integer movieId, @RequestBody LocalDate date ) {
        return ApiResponse.<List<String>>builder()
                .result(showService.searchCinemaByMovieandDate(movieId,date))
                .message("Success")
                .status(200)
                .build();
    }

    @GetMapping("/view-all-showtime")
    @PreAuthorize("permitAll()")
    public ApiResponse<List<ShowTimeV1Response>> getAllCinemaByMovieIdAndDate() {
        return ApiResponse.<List<ShowTimeV1Response>>builder()
                .result(showService.getAllShowTime())
                .message("Success")
                .status(200)
                .build();
    }
    @GetMapping("/view-all-room")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_SHOWTIME')")
    public ApiResponse<List<Cityresponse>> viewAllRoomFromCity() {
        return ApiResponse.<List<Cityresponse>>builder()
                .result(showService.getALLRoomFromCity())
                .message("Success")
                .status(200)
                .build();
    }
    @PostMapping("/create-showtime")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_SHOWTIME')")
    public ApiResponse<CreateShowTimeResponse> createShowTIme(@RequestBody @Valid CreateShowTImeRequest request) {
        return ApiResponse.<CreateShowTimeResponse>builder()
                .result(showService.createShowTime(request))
                .message("Success")
                .status(200)
                .build();
    }

    @PostMapping("/suggest-validate-time")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_SHOWTIME')")
    public ApiResponse<List<SuggestShowtimeResponse>> suggestTime(@RequestBody SuggestTimeRequest request) {
        return ApiResponse.<List<SuggestShowtimeResponse>>builder()
                .result(showService.suggestShowTimes(request))
                .message("Success")
                .status(200)
                .build();
    }
    @PostMapping("/suggest-validate-time-list/{movieId}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_SHOWTIME')")
    public ApiResponse<List<LocalTime>> suggestTimeList(@PathVariable Integer movieId) {
        return ApiResponse.<List<LocalTime>>builder()
                .result(showService.suggestShowTimesList(movieId))
                .message("Success")
                .status(200)
                .build();
    }

    @PutMapping("/update-showtime")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_SHOWTIME')")
    public ApiResponse<String> updateMovie(@RequestBody UpdateShowTimeRequest request) {
        return ApiResponse.<String>builder()
                .result(showService.updateShowTime(request))
                .message("Success")
                .status(200)
                .build();
    }
    @DeleteMapping("/delete-showtime")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'DELETE_SHOWTIME')")
    public ApiResponse<DeleteShowTimeResponse> deleteMovie(@RequestBody List<Integer> showTimeId) {
        DeleteShowTimeResponse response = showService.deleteShowTimes(showTimeId);
        return ApiResponse.<DeleteShowTimeResponse>builder()
                .result(response)
                .message("Success")
                .build();
    }

    @PutMapping("/on-off-showtime")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_SHOWTIME')")
    public ApiResponse<String> onOffShowtime(@RequestBody List<Integer> showTimeId) {
        showService.turnOnOffShowTime(showTimeId);
        return ApiResponse.<String>builder()
                .result("Cập nhật thành công")
                .build();
    }
}



