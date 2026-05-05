package movie.swp391.serviceImp;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.*;
import movie.swp391.entity.CinemaRoom;
import movie.swp391.entity.Movie;
import movie.swp391.entity.Showtime;
import movie.swp391.entity.TicketBooking;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.mapper.MovieMapper;
import movie.swp391.mapper.MovieStatusPeriodMapper;
import movie.swp391.mapper.RoomMapper;
import movie.swp391.mapper.ShowTimeMapper;
import movie.swp391.repository.*;
import movie.swp391.request.*;
import movie.swp391.response.*;
import movie.swp391.repository.*;
import movie.swp391.request.CreateShowTImeRequest;
import movie.swp391.request.SuggestTimeRequest;
import movie.swp391.request.UpdateShowTimeRequest;
import movie.swp391.response.*;
import movie.swp391.service.MovieService;
import movie.swp391.service.ShowTimeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class ShowTimeServiceImpl implements ShowTimeService {

    MovieRepository movieRepository;
    MovieMapper movieMapper;
    MovieStatusPeriodRepository movieStatusPeriodRepository;
    MovieStatusPeriodMapper movieStatusPeriodMapper;
    ShowtimeRepository showtimeRepository;
    CinemaRepository cinemaRepository;
    CityRepository cityRepository;
    ShowTimeMapper showTimeMapper;
    RoomMapper roomMapper;
    CinemaRoomRepository cinemaRoomRepository;
    TicketBookingRepository ticketBookingRepository;


    private static final Logger log = LoggerFactory.getLogger(ShowTimeServiceImpl.class);
    private final MovieService movieService;

    public List<LocalDate> searchDateByMovieId(Integer movieId) {
        Movie movie=movieRepository.findById(movieId).orElseThrow(() -> new AppException(ErrorHandler.MOVIE_NOT_EXISTED));
        LocalDate from = movieRepository.findMovieStatusPeriod_fromDateByMovieID(movieId);
        LocalDate to = movieRepository.findMovieStatusPeriod_toDateByMovieID(movieId);

        if (from == null || to == null) {
            return Collections.emptyList();
        }
        LocalDate today = LocalDate.now();
        LocalDate start = today.isAfter(from) ? today : from;

        List<LocalDate> dateList = new ArrayList<>();
        while (!start.isAfter(to)) {
            dateList.add(start);
            start = start.plusDays(1);
        }

        return dateList;

    }

    public List<String> searchCinemaByMovieandDate(Integer movieId, LocalDate date) {
        List<String> cinemaList = cinemaRepository.findCinemaByMovieIDAndDate(movieId, date);
        if (cinemaList.isEmpty()) {
            throw new AppException(ErrorHandler.LIST_EMPTY);
        }
        return cinemaList;


    }

    public List<ShowTimeV1Response> getAllShowTime() {
        List<City> cities = cityRepository.findAllWithShowtimes();
        log.info("Retrieved {} cities from database", cities.size());
        
        List<ShowTimeV1Response> responses = new ArrayList<>();
        
        for (City city : cities) {
            List<Cinema> cinemas = city.getCinemas();
            if (cinemas == null || cinemas.isEmpty()) {
                log.debug("City {} has no cinemas", city.getName());
                continue;
            }
            
            List<ShowTimeV1Response.CinemaDTO> cinemaDTOs = new ArrayList<>();
            for (Cinema cinema : cinemas) {
                // Explicitly fetch cinema rooms
                List<CinemaRoom> rooms = cinemaRoomRepository.findByCinemaCinemaID(cinema.getCinemaID());
                if (rooms == null || rooms.isEmpty()) {
                    log.debug("Cinema {} has no rooms", cinema.getName());
                    continue;
                }
                
                List<ShowTimeV1Response.CinemaRoomDTO> roomDTOs = new ArrayList<>();
                for (CinemaRoom room : rooms) {
                    // Explicitly fetch showtimes for this room
                    List<Showtime> showtimes = showtimeRepository.findByCinemaRoom_CinemaRoomID(room.getCinemaRoomID());
                    if (showtimes == null || showtimes.isEmpty()) {
                        log.debug("Room {} has no showtimes", room.getRoomName());
                        continue;
                    }
                    
                    Map<LocalDate, List<Showtime>> grouped = showtimes.stream()
                            .collect(Collectors.groupingBy(Showtime::getDate));
                    
                    List<ShowTimeV1Response.DateShowtimeDTO> dateShowtimeList = grouped.entrySet().stream()
                            .map(entry -> ShowTimeV1Response.DateShowtimeDTO.builder()
                                    .date(entry.getKey())
                                    .times(entry.getValue().stream()
                                            .map(showTimeMapper::toTimeWithMovieTitleDTO)
                                            .collect(Collectors.toList()))
                                    .build())
                            .collect(Collectors.toList());
                    
                    if (!dateShowtimeList.isEmpty()) {
                        roomDTOs.add(ShowTimeV1Response.CinemaRoomDTO.builder()
                                .cinemaRoomID(room.getCinemaRoomID())
                                .roomName(room.getRoomName())
                                .showtimes(dateShowtimeList)
                                .build());
                    }
                }
                
                if (!roomDTOs.isEmpty()) {
                    cinemaDTOs.add(ShowTimeV1Response.CinemaDTO.builder()
                            .cinemaID(cinema.getCinemaID())
                            .name(cinema.getName())
                            .cinemaRooms(roomDTOs)
                            .build());
                }
            }
            
            if (!cinemaDTOs.isEmpty()) {
                responses.add(ShowTimeV1Response.builder()
                        .cityName(city.getName())
                        .cinemas(cinemaDTOs)
                        .build());
                log.info("Added city {} with {} cinemas to response", city.getName(), cinemaDTOs.size());
            } else {
                log.debug("City {} has no cinemas with showtimes", city.getName());
            }
        }
        
        log.info("Returning {} cities with showtime data", responses.size());
        return responses;
    }

    @Transactional(readOnly = true)
    public List<Cityresponse> getALLRoomFromCity() {
        // Avoid fetching two List associations in one query (City.cinemas + Cinema.cinemaRooms).
        List<City> cities = cityRepository.findAllWithRooms();
        for (City city : cities) {
            if (city.getCinemas() == null) continue;
            for (Cinema cinema : city.getCinemas()) {
                List<CinemaRoom> rooms = cinemaRoomRepository.findByCinemaCinemaID(cinema.getCinemaID());
                cinema.setCinemaRooms(rooms);
            }
        }

        return cities.stream().map(roomMapper::toCityResponse).toList();
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoDisableExpiredShowTimes() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minusMinutes(15);

        List<Showtime> expiredActiveShowtimes = showtimeRepository.findAll().stream()
                .filter(showtime -> Boolean.TRUE.equals(showtime.getActive()))
                .filter(showtime -> {
                    LocalDateTime showtimeDateTime = LocalDateTime.of(showtime.getDate(), showtime.getTime());
                    return !showtimeDateTime.isAfter(cutoff);
                })
                .collect(Collectors.toList());

        if (expiredActiveShowtimes.isEmpty()) {
            return;
        }

        expiredActiveShowtimes.forEach(showtime -> showtime.setActive(false));
        showtimeRepository.saveAll(expiredActiveShowtimes);
        log.info("Auto-disabled {} expired showtimes at {}", expiredActiveShowtimes.size(), now);
    }

    public CreateShowTimeResponse createShowTime(CreateShowTImeRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new AppException(ErrorHandler.MOVIE_NOT_EXISTED));

        List<CinemaRoom> cinemaRooms = cinemaRoomRepository.findAllById(request.getCinemaRoomId());

        if (cinemaRooms.size() != request.getCinemaRoomId().size()) {
            throw new AppException(ErrorHandler.LIST_EMPTY);
        }

        for (CinemaRoom room : cinemaRooms) {
            if (!room.isActive()) {
                throw new AppException(ErrorHandler.INVALID_SHOWTIME,
                        String.format("Phòng %s đang không hoạt động, không thể tạo suất chiếu.", room.getRoomName()));
            }
        }

        List<Showtime> showtimesToSave = new ArrayList<>();

        int movieRuntime = movie.getRunningTime();
        int bufferTime = 30;
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        for (CinemaRoom room : cinemaRooms) {
            for (LocalDate date : request.getDates()) {
                for (LocalTime time : request.getTimes()) {
                    if (date.isEqual(today) && !time.isAfter(now)) {
                        throw new AppException(ErrorHandler.INVALID_SHOWTIME, String.format(
                                "Không thể tạo suất chiếu: Phòng %s, Ngày %s, Giờ %s đã qua thời gian hiện tại.",
                                room.getRoomName(), date, time));
                    }
                    LocalTime startTime = time;
                    LocalTime endTime = time.plusMinutes(movieRuntime + bufferTime);

                    // Check for conflicts in the same room
                    List<Showtime> existingShowtimes = showtimeRepository.findByDateAndCinemaRoom_CinemaRoomID(date, room.getCinemaRoomID());

                    if (!existingShowtimes.isEmpty()) {
                        for (Showtime existing : existingShowtimes) {
                            int existingRuntime = existing.getMovie().getRunningTime();
                            LocalTime existingStart = existing.getTime();
                            LocalTime existingEnd = existingStart.plusMinutes(existingRuntime + bufferTime);

                            if (!(!(endTime.isAfter(existingStart)) || !(startTime.isBefore(existingEnd)))) {
                                throw new AppException(ErrorHandler.INVALID_SHOWTIME, String.format(
                                        "Trùng: Phòng %s, Ngày %s, Movie trùng bắt đầu: %s, Movie trùng kết thúc: %s, Movie: %s",
                                        room.getRoomName(), date, existingStart, existingEnd, existing.getMovie().getTitle()));
                            }
                        }
                    }

                    // Check for conflicts in the same cinema (different rooms)
                    List<Showtime> existingShowtimesInCinema = showtimeRepository.findByDateAndCinemaRoom_Cinema_CinemaID(date, room.getCinema().getCinemaID());

                    if (!existingShowtimesInCinema.isEmpty()) {
                        for (Showtime existing : existingShowtimesInCinema) {
                            // Skip if it's the same room (already checked above)
                            if (existing.getCinemaRoom().getCinemaRoomID().equals(room.getCinemaRoomID())) {
                                continue;
                            }

                            int existingRuntime = existing.getMovie().getRunningTime();
                            LocalTime existingStart = existing.getTime();
                            LocalTime existingEnd = existingStart.plusMinutes(existingRuntime + bufferTime);

                            if (endTime.equals(existingEnd) || startTime.equals(existingStart)){
                                throw new AppException(ErrorHandler.INVALID_SHOWTIME, String.format(
                                        "Không nên tạo suất trùng thời gian nhưng khác phòng: Phòng %s, Ngày %s, Giờ %s trùng với Phòng %s, Movie: %s",
                                        room.getRoomName(), date, time, existing.getCinemaRoom().getRoomName(), existing.getMovie().getTitle()));
                            }
                        }
                    }

                    Showtime showtime = Showtime.builder()
                            .movie(movie)
                            .cinemaRoom(room)
                            .date(date)
                            .time(time)
                            .version(request.getVersion())
                            .active(true)
                            .build();
                    showtimesToSave.add(showtime);
                }
            }
        }

        showtimeRepository.saveAll(showtimesToSave);
        movieService.syncMovieStatusPeriodByShowtimes(movie.getMovieID());

        return CreateShowTimeResponse.builder()
                .createdCount(showtimesToSave.size())
                .conflicts(Collections.emptyList())
                .build();
    }



    public List<SuggestShowtimeResponse> suggestShowTimes(SuggestTimeRequest request) {
        List<LocalTime> times = showtimeRepository.findTimesByDateAndCinemaRoom(request.getDate(), request.getCinemaRoomId());
        times.removeIf(time -> time.isAfter(LocalTime.of(23, 0)));
        times.removeIf(time -> time.isBefore(LocalTime.of(7, 0)));
        times.sort(Comparator.naturalOrder());
        Integer runTimeMovie = movieRepository.findRunningTimeByMovieID(request.getMovieId());
        if (runTimeMovie == null) {
            throw new AppException(ErrorHandler.MOVIE_NOT_EXISTED);
        }
        int bufferMinutes = 30;
        List<SuggestShowtimeResponse> suggestedTimes = new ArrayList<>();
        LocalDate nowDate = LocalDate.now();
        LocalTime nowTime = LocalTime.now();

        if (times.isEmpty()) {
            LocalTime start = LocalTime.of(7, 0);
            LocalTime end = LocalTime.of(23,0);
            long intervalMinutes = roundToMultipleOfFive(30 + runTimeMovie);

            long totalMinutes = Duration.between(start, end).toMinutes();

            for (long minutes = 0; minutes < totalMinutes; minutes += intervalMinutes) {
                if (request.getDate().isEqual(nowDate)){
                    if ( start.plusMinutes(minutes).isBefore(nowTime)) continue;
                }
                if (start.plusMinutes(minutes).isAfter(LocalTime.of(23,0))) continue;
                suggestedTimes.add(
                        SuggestShowtimeResponse.builder()
                                .startTime(roundTime(start.plusMinutes(minutes)))
                                .endTime(roundTime(start.plusMinutes(minutes)).plusMinutes(runTimeMovie))
                                .build()
                );
            }
            return suggestedTimes;
        }
        else {

            if (!times.contains(LocalTime.of(7, 0))) {
                times.add(0, LocalTime.of(7, 0));
            }
            if (!times.contains(LocalTime.of(23, 0))) {
                times.add(LocalTime.of(23, 0));
            }

            times = times.stream().distinct().sorted().collect(Collectors.toList());


            for (int i = 0; i < times.size() - 1; i++) {
                LocalTime currentStart = times.get(i);
                LocalTime currentEnd;
                Integer runningTineMovieData=0;
                runningTineMovieData=showtimeRepository.findMovie_RunningTimeByDateAndTime(request.getDate(),currentStart, request.getCinemaRoomId());
                if (runningTineMovieData==null) {runningTineMovieData=0;}
                if (i!=0 || runningTineMovieData!=0 ) {

                    currentEnd = currentStart.plusMinutes(roundToMultipleOfFive(runningTineMovieData+bufferMinutes));
                }
                else currentEnd = currentStart.plusMinutes(0);



                LocalTime nextStart = times.get(i + 1);
                long availableMinutes = 0;
                if (!currentStart.isAfter(currentEnd))
                    availableMinutes = Duration.between(currentEnd, nextStart).toMinutes();

                else     availableMinutes =24*60- Duration.between(currentEnd, nextStart).toMinutes();

                if (nextStart.equals(LocalTime.of(23, 0)) && !currentEnd.isAfter(nextStart)) {
                    if (roundToMultipleOfFive(runTimeMovie+bufferMinutes)>availableMinutes)
                        availableMinutes=roundToMultipleOfFive(runTimeMovie+bufferMinutes);
                }
                if (availableMinutes <= 0) continue;
                long totalSlot =  runTimeMovie + bufferMinutes;
                totalSlot= roundToMultipleOfFive(totalSlot);
                int t =0;

                while (availableMinutes >= totalSlot) {
                    availableMinutes -= totalSlot;
                    currentEnd = currentEnd.plusMinutes(t == 0 ? 0:totalSlot);
                    t++;
                    if (currentEnd.isBefore(nextStart)) {
                        if (request.getDate().isEqual(nowDate)){
                            if ( currentEnd.isBefore(nowTime)) continue;
                        }
                        suggestedTimes.add(
                                SuggestShowtimeResponse.builder()
                                        .startTime(roundTime(currentEnd))
                                        .endTime(roundTime(currentEnd).plusMinutes(runTimeMovie))
                                        .build()
                        );
                    }
                }
            }

            return suggestedTimes;
        }
    }


    private LocalTime roundTime(LocalTime time) {
        int minute = time.getMinute();
        int mod = minute % 5;


        if (mod != 0) {
            minute += (5 - mod);
            if (minute >= 60) {
                time = time.plusHours(1);
                minute = 0;
            }
        }

        return LocalTime.of(time.getHour(), minute);
    }

    private long roundToMultipleOfFive(long value) {
        long mod = value % 5;

        if (mod != 0) {
            value += (5 - mod);
        }

        return value;
    }
    public List<LocalTime> suggestShowTimesList(Integer movieId) {
        Integer runTimeMovie = movieRepository.findRunningTimeByMovieID(movieId);
        List<LocalTime> suggestedTimes = new ArrayList<>();
        LocalTime start = LocalTime.of(0, 0);
        LocalTime end = LocalTime.of(23, 59);
        int intervalMinutes = 30 + runTimeMovie;

        long totalMinutes = Duration.between(start, end).toMinutes();

        for (long minutes = 0; minutes <= totalMinutes; minutes += intervalMinutes) {

            suggestedTimes.add(roundTime(start.plusMinutes(minutes)));
        }

        return suggestedTimes;

    }

    public String updateShowTime(UpdateShowTimeRequest request) {
        Showtime existingShowtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new AppException(ErrorHandler.SHOWTIME_NOT_EXISTED));
        Integer oldMovieId = existingShowtime.getMovie() != null ? existingShowtime.getMovie().getMovieID() : null;

        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new AppException(ErrorHandler.MOVIE_NOT_EXISTED));

        CinemaRoom cinemaRoom = cinemaRoomRepository.findById(request.getCinemaRoomId())
                .orElseThrow(() -> new AppException(ErrorHandler.CINEMA_ROOM_NOT_FOUND));

        validateNoSameRoomOverlapForUpdate(existingShowtime.getShowtimeID(), movie, cinemaRoom, request.getDate(), request.getTime());

        existingShowtime.setMovie(movie);
        existingShowtime.setCinemaRoom(cinemaRoom);
        existingShowtime.setDate(request.getDate());
        existingShowtime.setTime(request.getTime());
        existingShowtime.setVersion(request.getVersion());

        showtimeRepository.save(existingShowtime);
        movieService.syncMovieStatusPeriodByShowtimes(movie.getMovieID());
        if (oldMovieId != null && !oldMovieId.equals(movie.getMovieID())) {
            movieService.syncMovieStatusPeriodByShowtimes(oldMovieId);
        }

        return "Đã cập nhật thành công";
    }

    private void validateNoSameRoomOverlapForUpdate(Integer currentShowtimeId, Movie movie, CinemaRoom cinemaRoom, LocalDate date, LocalTime time) {
        int bufferTime = 30;
        LocalTime requestedStart = time;
        LocalTime requestedEnd = time.plusMinutes(movie.getRunningTime() + bufferTime);

        List<Showtime> existingShowtimes = showtimeRepository
                .findByDateAndCinemaRoom_CinemaRoomID(date, cinemaRoom.getCinemaRoomID())
                .stream()
                .filter(showtime -> !showtime.getShowtimeID().equals(currentShowtimeId))
                .toList();

        for (Showtime existing : existingShowtimes) {
            int existingRuntime = existing.getMovie().getRunningTime();
            LocalTime existingStart = existing.getTime();
            LocalTime existingEnd = existingStart.plusMinutes(existingRuntime + bufferTime);

            boolean overlaps = requestedStart.isBefore(existingEnd) && requestedEnd.isAfter(existingStart);
            if (overlaps) {
                throw new AppException(ErrorHandler.INVALID_SHOWTIME, String.format(
                        "Không thể cập nhật suất chiếu: Phòng %s, Ngày %s, Giờ bắt đầu %s bị trùng với suất chiếu hiện có từ %s đến %s của phim %s.",
                        cinemaRoom.getRoomName(), date, requestedStart, existingStart, existingEnd, existing.getMovie().getTitle()));
            }
        }
    }

    public DeleteShowTimeResponse deleteShowTimes(List<Integer> showtimeIds) {
        List<String> failedToDelete = new ArrayList<>();
        int deletedCount = 0;
        Set<Integer> affectedMovieIds = new HashSet<>();

        for (Integer showtimeId : showtimeIds) {
            Optional<Showtime> optionalShowtime = showtimeRepository.findById(showtimeId);

            if (optionalShowtime.isEmpty()) {
                failedToDelete.add(String.format("Showtime ID %d không tồn tại.", showtimeId));
                continue;
            }

            Showtime showtime = optionalShowtime.get();
            if (showtime.getMovie() != null) {
                affectedMovieIds.add(showtime.getMovie().getMovieID());
            }

            List<TicketBooking> bookings = showtime.getBookings();
            if (bookings != null && !bookings.isEmpty()) {
                for (TicketBooking booking : bookings) {
                    booking.setShowtime(null);
                }
                ticketBookingRepository.saveAll(bookings);
            }

            showtimeRepository.deleteById(showtime.getShowtimeID());
            deletedCount++;
        }

        affectedMovieIds.forEach(movieService::syncMovieStatusPeriodByShowtimes);

        return new DeleteShowTimeResponse(deletedCount, failedToDelete);
    }


    @Override
    public void turnOnOffShowTime(List<Integer> showTimeId){
        List<Showtime> showtimes = showtimeRepository.findAllById(showTimeId);
        Set<Integer> affectedMovieIds = showtimes.stream()
                .map(Showtime::getMovie)
                .filter(Objects::nonNull)
                .map(Movie::getMovieID)
                .collect(Collectors.toSet());

        for (Showtime showtime : showtimes) {
            if (showtime.getActive()) {
                if (checkIfShowTimeAfterDay(showtime)) {
                    String mess = "Suốt chiếu " + showtime.getDate() +" với thời gian " +showtime.getTime() + " đang hoạt động!!";
                    throw new AppException(ErrorHandler.SHOWTIME_IN_ACTIVE, mess);
                }
            }
        }
        for (Showtime showtime : showtimes) {
            showtime.setActive(!showtime.getActive());
        }
        showtimeRepository.saveAll(showtimes);
        affectedMovieIds.forEach(movieService::syncMovieStatusPeriodByShowtimes);
    }

    public boolean checkIfShowTimeAfterDay(Showtime showtime) {


        LocalDateTime now = LocalDateTime.now();
        LocalDateTime showtimeDateTime = LocalDateTime.of(showtime.getDate(), showtime.getTime());

        return showtimeDateTime.isAfter(now);

    }
}

