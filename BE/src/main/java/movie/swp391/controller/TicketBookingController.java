package movie.swp391.controller;

import lombok.RequiredArgsConstructor;
import movie.swp391.request.TicketBookingRequest;
import movie.swp391.request.promotion.BookingPreviewRequest;
import movie.swp391.request.promotion.PromotionDto;
import movie.swp391.response.*;
import movie.swp391.response.*;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.CinemaRoomAdminService;
import movie.swp391.service.CinemaService;
import movie.swp391.service.PromotionService;
import movie.swp391.service.TicketBookingService;
import movie.swp391.repository.FoodAndDrinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TicketBookingController {

    private final TicketBookingService ticketBookingService;
    private final CinemaService cinemaService;
    private final CinemaRoomAdminService cinemaRoomAdminService;
    @Autowired
    private PromotionService promotionService;
    @Autowired
    private FoodAndDrinkRepository foodAndDrinkRepository;

    // Movie Selection Endpoints


    @GetMapping("/customer/movies/{movieId}/choose-dates")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_TICKET')")
    public ResponseEntity<BaseResponse<List<LocalDate>>> getAvailableDates(
            @PathVariable Integer movieId) {
        return ResponseEntity.ok(ticketBookingService.getAvailableDates(movieId));
    }

    @GetMapping("/customer/movies/{movieId}/dates/{date}/choose-times")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_TICKET')")
    public ResponseEntity<BaseResponse<List<LocalTime>>> getAvailableTimes(
            @PathVariable Integer movieId,
            @PathVariable LocalDate date) {
        return ResponseEntity.ok(ticketBookingService.getAvailableTimes(movieId, date));
    }


    @PostMapping("/customer/movies/booking-confirmation")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_TICKET')")
    public ResponseEntity<BaseResponse<BookingConfirmationResponse>> getBookingConfirmation(
            @RequestBody TicketBookingRequest request ) {
        return ResponseEntity.ok(ticketBookingService.getBookingConfirmation(request));
    }

    // Booking Endpoints
    @PostMapping("/customer/confirm-bookings")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'CREATE_TICKET')")
    public ResponseEntity<BaseResponse<TicketBookingResponse>> createBooking(
            @RequestBody TicketBookingRequest request) {
        return ResponseEntity.ok(ticketBookingService.createBooking(request));
    }

    @GetMapping("/customer/view-bookinged-ticket")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_TICKET')")
    public ResponseEntity<BaseResponse<List<TicketBookingResponse>>> getCustomerBookings(
            @RequestParam Integer customerId) {
        return ResponseEntity.ok(ticketBookingService.getCustomerBookings(customerId));
    }

    @GetMapping("/customer/get-booking-by-status/{status}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_TICKET')")
    public ResponseEntity<BaseResponse<List<TicketBookingResponse>>> getCustomerBookingsByStatus(
            @RequestParam Integer customerId,
            @PathVariable String status) {
        return ResponseEntity.ok(ticketBookingService.getCustomerBookingsByStatus(customerId, status));
    }

    @PostMapping("/customer/bookings/{bookingId}/cancel")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_TICKET')")
    public ResponseEntity<BaseResponse<String>> cancelBooking(
            @PathVariable Integer bookingId) {
        return ResponseEntity.ok(ticketBookingService.cancelBooking(bookingId));
    }

    @GetMapping("/customer/choose-cinema")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_TICKET')")
    public ResponseEntity<BaseResponse<List<CinemaResponse>>> getAllCinemas() {
        return ResponseEntity.ok(cinemaService.getAllCinemas());
    }

    @GetMapping("/customer/get-all-city")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_TICKET')")
    public ResponseEntity<BaseResponse<List<CinemaRoomResponse>>> getAllCinemaRooms() {
        return ResponseEntity.ok(cinemaRoomAdminService.getAllCinemaRooms());
    }

    @GetMapping("/customer/view-all-showtime/{movieId}")
    @PreAuthorize("permitAll()")
    public ApiResponse<ShowTimeForCustomerResponse> getShowtimeByMovie(@PathVariable Integer movieId) {
        return ApiResponse.<ShowTimeForCustomerResponse>builder()
                .result(ticketBookingService.getShowtimeForCustomer(movieId))
                .message("Success")
                .status(200)
                .build();
    }

    @PostMapping("/customer/preview-promotions")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_TICKET')")
    public ResponseEntity<BaseResponse<List<PromotionDto>>> previewPromotions(
            @RequestBody BookingPreviewRequest request
    ) {
        List<PromotionDto> promotions = promotionService.getValidPromotionsForPreview(
                request.getCustomerId(),
                request.getMovieId(),
                request.getCinemaRoomId(),
                request.getShowDate(),
                request.getShowTime(),
                request.getSeatIds()
        );
        return ResponseEntity.ok(new BaseResponse<>("Danh sách promotion hợp lệ", true, promotions));
    }


} 
