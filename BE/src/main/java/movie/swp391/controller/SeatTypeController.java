package movie.swp391.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.request.SeatTypeRequest;
import movie.swp391.response.ApiResponse;
import movie.swp391.response.SeatTypeResponse;
import movie.swp391.service.SeatTypeService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seat-types")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatTypeController {

    SeatTypeService seatTypeService;

    @GetMapping
    public ApiResponse<List<SeatTypeResponse>> getAllSeatTypes() {
        return ApiResponse.<List<SeatTypeResponse>>builder()
                .result(seatTypeService.getAllSeatTypes())
                .message("Success")
                .status(200)
                .build();
    }

    @GetMapping("/{seatTypeId}")
    public ApiResponse<SeatTypeResponse> getSeatType(@PathVariable Integer seatTypeId) {
        return ApiResponse.<SeatTypeResponse>builder()
                .result(seatTypeService.getSeatType(seatTypeId))
                .message("Success")
                .status(200)
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SeatTypeResponse> createSeatType(@Valid @RequestBody SeatTypeRequest request) {
        return ApiResponse.<SeatTypeResponse>builder()
                .result(seatTypeService.createSeatType(request))
                .message("Successfully created seat type")
                .status(200)
                .build();
    }

    @PutMapping("/{seatTypeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SeatTypeResponse> updateSeatType(@PathVariable Integer seatTypeId, @Valid @RequestBody SeatTypeRequest request) {
        return ApiResponse.<SeatTypeResponse>builder()
                .result(seatTypeService.updateSeatType(seatTypeId, request))
                .message("Successfully updated seat type")
                .status(200)
                .build();
    }

    @DeleteMapping("/{seatTypeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteSeatType(@PathVariable Integer seatTypeId) {
        seatTypeService.deleteSeatType(seatTypeId);
        return ApiResponse.<String>builder()
                .result("Deleted seat type")
                .message("Success")
                .status(200)
                .build();
    }
}

