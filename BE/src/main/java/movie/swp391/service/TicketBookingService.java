package movie.swp391.service;

import movie.swp391.request.TicketBookingRequest;
import movie.swp391.response.*;
import movie.swp391.response.BookingConfirmationResponse;
import movie.swp391.response.SeatSelectionResponse;
import movie.swp391.response.ShowTimeForCustomerResponse;
import movie.swp391.response.TicketBookingResponse;
import movie.swp391.response.common.BaseResponse;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface TicketBookingService {
    // Movie Selection Methods
    BaseResponse<List<LocalDate>> getAvailableDates(Integer movieId);
    BaseResponse<List<LocalTime>> getAvailableTimes(Integer movieId, LocalDate date);

    // Seat Selection Methods
    BaseResponse<SeatSelectionResponse> getAvailableSeats(Integer movieId, LocalDate date, LocalTime time);
    BaseResponse<BookingConfirmationResponse> getBookingConfirmation(
            TicketBookingRequest request);

    // Booking Methods
    BaseResponse<TicketBookingResponse> createBooking(TicketBookingRequest request);
    BaseResponse<List<TicketBookingResponse>> getCustomerBookings(Integer customerId);
    BaseResponse<List<TicketBookingResponse>> getCustomerBookingsByStatus(Integer customerId, String status);
    BaseResponse<String> cancelBooking(Integer bookingId);
    List<TicketBookingResponse> getAllBookings();



    ShowTimeForCustomerResponse getShowtimeForCustomer(Integer movieId);

} 
