package movie.swp391.service;

import movie.swp391.request.CinemaRequest;
import movie.swp391.response.CinemaAdminResponse;
import movie.swp391.response.CityOptionResponse;
import movie.swp391.response.common.BaseResponse;

import java.util.List;

public interface CinemaAdminService {
    BaseResponse<List<CinemaAdminResponse>> getAllCinemas();

    BaseResponse<CinemaAdminResponse> createCinema(CinemaRequest request);

    BaseResponse<CinemaAdminResponse> updateCinema(Integer cinemaId, CinemaRequest request);

    BaseResponse<String> deleteCinema(Integer cinemaId);

    BaseResponse<List<CityOptionResponse>> getAllCities();
}

