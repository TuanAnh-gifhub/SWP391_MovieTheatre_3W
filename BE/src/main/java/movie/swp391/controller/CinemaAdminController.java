package movie.swp391.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import movie.swp391.request.CinemaRequest;
import movie.swp391.response.CinemaAdminResponse;
import movie.swp391.response.CityOptionResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.CinemaAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cinemas")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
public class CinemaAdminController {

    private final CinemaAdminService cinemaAdminService;

    @GetMapping
    public ResponseEntity<BaseResponse<List<CinemaAdminResponse>>> getAllCinemas() {
        return ResponseEntity.ok(cinemaAdminService.getAllCinemas());
    }

    @PostMapping
    public ResponseEntity<BaseResponse<CinemaAdminResponse>> createCinema(@Valid @RequestBody CinemaRequest request) {
        return ResponseEntity.ok(cinemaAdminService.createCinema(request));
    }

    @PutMapping("/{cinemaId}")
    public ResponseEntity<BaseResponse<CinemaAdminResponse>> updateCinema(
            @PathVariable Integer cinemaId,
            @Valid @RequestBody CinemaRequest request) {
        return ResponseEntity.ok(cinemaAdminService.updateCinema(cinemaId, request));
    }

    @DeleteMapping("/{cinemaId}")
    public ResponseEntity<BaseResponse<String>> deleteCinema(@PathVariable Integer cinemaId) {
        return ResponseEntity.ok(cinemaAdminService.deleteCinema(cinemaId));
    }

    @GetMapping("/cities")
    public ResponseEntity<BaseResponse<List<CityOptionResponse>>> getAllCities() {
        return ResponseEntity.ok(cinemaAdminService.getAllCities());
    }
}

