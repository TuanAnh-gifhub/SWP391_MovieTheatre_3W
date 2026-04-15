package movie.swp391.controller;

import lombok.RequiredArgsConstructor;
import movie.swp391.request.CinemaRoomRequest;
import movie.swp391.response.CinemaRoomResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.CinemaRoomAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cinema-rooms")
@RequiredArgsConstructor
public class CinemaRoomAdminController {

    private final CinemaRoomAdminService cinemaRoomAdminService;

    @PostMapping
    @PreAuthorize("@permissionService.hasPermission(authentication, 'ADD_CINEMA_ROOM')")
    public ResponseEntity<BaseResponse<List<CinemaRoomResponse>>> createCinemaRoom(
            @RequestBody CinemaRoomRequest request) {
        return ResponseEntity.ok(cinemaRoomAdminService.createCinemaRoom(request));
    }

    @GetMapping
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_CINEMA_ROOM')")
    public ResponseEntity<BaseResponse<List<CinemaRoomResponse>>> getAllCinemaRooms() {
        return ResponseEntity.ok(cinemaRoomAdminService.getAllCinemaRooms());
    }



    @PutMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_CINEMA_ROOM')")
    public ResponseEntity<BaseResponse<CinemaRoomResponse>> updateCinemaRoom(
            @PathVariable Integer id,
            @RequestBody CinemaRoomRequest request) {
        return ResponseEntity.ok(cinemaRoomAdminService.updateCinemaRoom(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'DELETE_CINEMA_ROOM')")
    public ResponseEntity<BaseResponse<String>> deleteCinemaRoom(
            @PathVariable Integer id) {
        return ResponseEntity.ok(cinemaRoomAdminService.deleteCinemaRoom(id));
    }
    @PutMapping("/{id}/set-active")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_CINEMA_ROOM')")
    public ResponseEntity<BaseResponse<CinemaRoomResponse>> setActiveStatus(
            @PathVariable Integer id,
            @RequestParam boolean active) {
        return ResponseEntity.ok(cinemaRoomAdminService.setActiveStatus(id, active));
    }
}