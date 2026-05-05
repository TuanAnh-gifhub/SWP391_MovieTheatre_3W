package movie.swp391.service;

import movie.swp391.request.CreateSeatRequest;
import movie.swp391.request.UpdateSeatRequest;
import movie.swp391.request.UpdateSeatTypeBatchRequest;
import movie.swp391.response.SeatFromCityresponse;

import java.util.List;

public interface SeatService {
    List<SeatFromCityresponse> viewAllSeat() ;
    String createSeatsForRoom(CreateSeatRequest request);
    String updateSeat(UpdateSeatRequest request);
    String updateSeatTypeBatch(UpdateSeatTypeBatchRequest request);
    void turnOnOffSeat(List<Integer> seatId);








}
