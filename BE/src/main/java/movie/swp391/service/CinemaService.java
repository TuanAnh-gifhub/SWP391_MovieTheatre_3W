package movie.swp391.service;

import movie.swp391.response.CinemaResponse;
import movie.swp391.response.common.BaseResponse;

import java.util.List;

public interface CinemaService {
    BaseResponse<List<CinemaResponse>> getAllCinemas();
} 