package movie.swp391.service;

import movie.swp391.request.CinemaRoomRequest;
import movie.swp391.response.CinemaRoomResponse;
import movie.swp391.response.common.BaseResponse;

import java.util.List;

public interface CinemaRoomAdminService {
    BaseResponse<List<CinemaRoomResponse>> createCinemaRoom(CinemaRoomRequest request);
    BaseResponse<CinemaRoomResponse> getCinemaRoomById(Integer id);
    BaseResponse<List<CinemaRoomResponse>> getAllCinemaRooms();
    BaseResponse<CinemaRoomResponse> updateCinemaRoom(Integer id, CinemaRoomRequest request);
    BaseResponse<String> deleteCinemaRoom(Integer id);
    BaseResponse<CinemaRoomResponse> setActiveStatus(Integer id, boolean active);
} 