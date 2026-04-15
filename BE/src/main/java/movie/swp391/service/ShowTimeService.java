package movie.swp391.service;

import movie.swp391.request.*;
import movie.swp391.response.*;
import movie.swp391.request.CreateShowTImeRequest;
import movie.swp391.request.SuggestTimeRequest;
import movie.swp391.request.UpdateShowTimeRequest;
import movie.swp391.response.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ShowTimeService {

    List<LocalDate> searchDateByMovieId(Integer movieId);
    List<String> searchCinemaByMovieandDate(Integer movieId, LocalDate date);
    List<ShowTimeV1Response> getAllShowTime();
    List<Cityresponse>  getALLRoomFromCity();
    CreateShowTimeResponse createShowTime(CreateShowTImeRequest request);
    List<SuggestShowtimeResponse> suggestShowTimes(SuggestTimeRequest request);
    List<LocalTime> suggestShowTimesList(Integer movieId);
    String updateShowTime(UpdateShowTimeRequest request);
    DeleteShowTimeResponse deleteShowTimes(List<Integer> showtimeIds);
    void turnOnOffShowTime(List<Integer> movieId);









}

