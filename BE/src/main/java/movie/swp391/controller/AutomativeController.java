package movie.swp391.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.request.*;
import movie.swp391.response.*;
import movie.swp391.request.AutoRequest;
import movie.swp391.response.ApiResponse;
import movie.swp391.service.AutomativeService;
import movie.swp391.service.MemberService;
import movie.swp391.service.MovieService;
import movie.swp391.service.ShowTimeService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/showtime")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class AutomativeController {

    MemberService memberService;
    MovieService movieService;
   ShowTimeService showService;
    AutomativeService automativeService;


    @GetMapping("/auto-add-movie")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_AUTOMATIVE')")
    public ApiResponse<String> autoAddMovie(@RequestParam(required = false, defaultValue = "true") Boolean turn) {
        String result = automativeService.autoAddMovie(turn);
        return ApiResponse.<String>builder()
                .result(result)
                .message("Success")
                .status(200)
                .build();
    }

    @PostMapping("/create-showtime-automotive")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_AUTOMATIVE')")
    public ApiResponse<String> createShowtimeAuto(@RequestBody LocalDate date) {
        automativeService.autoGenerateShowtime(date);
        return ApiResponse.<String>builder()
                .result("Đã bật thành công")
                .build();
    }


    @PostMapping("/auto-showtime")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_AUTOMATIVE')")
    public ApiResponse<String> autoShowTimeV2(@RequestBody AutoRequest autoRequest) {
        automativeService.updateNumberOfShowtimesForCinema(autoRequest);
        return ApiResponse.<String>builder()
                .result("Suất đã được tự động")
                .build();
    }


}



