package movie.swp391.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.response.ApiResponse;
import movie.swp391.response.MovieDayRevenueResponse;
import movie.swp391.serviceImp.ExportServiceImpl;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/export-movie-date")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class ExportMovieDateController {

    ExportServiceImpl exportService;


    @GetMapping("/summary-by-date")
    public ApiResponse<List<MovieDayRevenueResponse>> getExportSummaryByDate() {


        return ApiResponse.<List<MovieDayRevenueResponse>>builder()
                .status(200)
                .message("Thống kê doanh thu tất cả các ngày thành công")
                .result(exportService.getSummaryByExportDate())
                .build();
    }



}
