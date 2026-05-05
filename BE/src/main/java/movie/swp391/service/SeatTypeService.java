package movie.swp391.service;

import movie.swp391.request.SeatTypeRequest;
import movie.swp391.response.SeatTypeResponse;

import java.util.List;

public interface SeatTypeService {
    List<SeatTypeResponse> getAllSeatTypes();
    SeatTypeResponse getSeatType(Integer seatTypeId);
    SeatTypeResponse createSeatType(SeatTypeRequest request);
    SeatTypeResponse updateSeatType(Integer seatTypeId, SeatTypeRequest request);
    void deleteSeatType(Integer seatTypeId);
}

