package movie.swp391.service;

import movie.swp391.response.CinemaRoomResponse;
import movie.swp391.response.common.BaseResponse;

import java.util.List;

public interface CinemaRoomService {
    BaseResponse<List<CinemaRoomResponse>> getAllCinemaRooms();
    BaseResponse<List<CinemaRoomResponse>> getCinemaRoomsByCinemaId(Integer cinemaId);
} 