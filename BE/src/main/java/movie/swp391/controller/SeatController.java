package movie.swp391.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.request.CreateSeatRequest;
import movie.swp391.request.UpdateSeatRequest;
import movie.swp391.response.ApiResponse;
import movie.swp391.response.SeatFromCityresponse;
import movie.swp391.service.EmployeeService;
import movie.swp391.service.SeatService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatController {

    EmployeeService employeeService;
    SeatService seatService;

    @GetMapping("/get-all-seats")
    public ApiResponse<List<SeatFromCityresponse>> getAllEmployees() {
        return ApiResponse.<List<SeatFromCityresponse>>builder()
                .result(seatService.viewAllSeat())
                .message("Success")
                .status(200)
                .build();
    }
    @PostMapping("/create-seats")
    public ApiResponse<String> createSeatsForRoom(@RequestBody CreateSeatRequest request) {
        String seats = seatService.createSeatsForRoom(request);
        return ApiResponse.<String>builder()
                .result(seats)
                .message("Sucessfully")
                .status(200)
                .build();
    }
    @PutMapping("/update-seat")
    public ApiResponse<String> updateSeat(@RequestBody UpdateSeatRequest request) {
        String updatedSeat = seatService.updateSeat(request);
        return ApiResponse.<String>builder()
                .result(updatedSeat)
                .message("Successfully")
                .status(200)
                .build();
    }

    @PutMapping("/toggle-availability")
    public ApiResponse<String> toggleSeatAvailability(@RequestBody List<Integer> seatIds) {
        seatService.turnOnOffSeat(seatIds);
        return ApiResponse.<String>builder()
                .result("Đã cập nhật trạng thái ghế thành công")
                .message("Success")
                .status(200)
                .build();
    }

} 