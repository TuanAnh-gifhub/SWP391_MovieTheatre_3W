package movie.swp391.serviceImp;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import movie.swp391.entity.*;
import movie.swp391.entity.CinemaRoom;
import movie.swp391.entity.Movie;
import movie.swp391.entity.Showtime;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.repository.*;
import movie.swp391.repository.CinemaRoomRepository;
import movie.swp391.repository.MovieRepository;
import movie.swp391.repository.MovieStatusPeriodRepository;
import movie.swp391.repository.ShowtimeRepository;
import movie.swp391.request.AutoRequest;
import movie.swp391.request.SuggestTimeRequest;
import movie.swp391.response.SuggestShowtimeResponse;
import movie.swp391.service.AutomativeService;
import movie.swp391.service.MovieTMDBService;
import movie.swp391.service.ShowTimeService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class AutomativeServiceImpl implements AutomativeService {

    private Map<String, Integer> genreMovieIndexMap = new HashMap<>();

    MovieTMDBService movieTMDBService;
    CinemaRoomRepository roomRepository;
    MovieRepository movieRepository;
    final int BUFFER_TIME = 30;
    ShowtimeRepository showtimeRepository;
    MovieStatusPeriodRepository movieStatusPeriodRepository;
    CinemaRoomRepository cinemaRoomRepository;
    ShowTimeService showTimeService;


    @Override
    public String autoAddMovie(Boolean turn) {
        if (turn) {
            movieTMDBService.importMoviesFromTMDB();
            return "Đã bật thành công";
        }
        return "Đã tắt thành công";
    }

    @Override
    @Transactional
    public void updateNumberOfShowtimesForCinema(AutoRequest request) {
        List<Movie> movies = movieRepository.findAll();
        if (movies.isEmpty()) return;

        int totalTicketsSold = movies.stream().mapToInt(Movie::getSeller).sum();
        int totalRank = movies.stream().mapToInt(Movie::getRank).sum();

        double averageRuntime = movies.stream()
                .filter(m -> m.getRunningTime() != null)
                .mapToInt(Movie::getRunningTime)
                .average()
                .orElse(1) + 30;

        List<Object[]> allCinemaRoomData = cinemaRoomRepository.findCinemaIdSeatCountAndRoomId();

        boolean cinemaExists = allCinemaRoomData.stream()
                .anyMatch(row -> ((Number) row[0]).intValue() == request.getCinemaId());

        if (!cinemaExists) {
            throw new AppException(ErrorHandler.CINEMA_NOT_FOUND);
        }

        // Filter only rooms in this cinema
        List<Object[]> cinemaRoomData = allCinemaRoomData.stream()
                .filter(row -> ((Number) row[0]).intValue() == request.getCinemaId())
                .toList();
        if (cinemaRoomData.isEmpty()) return;

        // Extract roomIds
        List<Integer> roomIds = cinemaRoomData.stream()
                .map(row -> ((Number) row[2]).intValue())
                .collect(Collectors.toList());

        // STEP 1: Set numberShowtime = 1 for all movies
        for (Movie movie : movies) {
            movie.setNumberShowtime(1);
        }

        // STEP 2: Calculate total available slot
        int roomCount = roomIds.size();
        int totalSlot = (int) Math.round((15.0 * 60 / averageRuntime) * roomCount * request.getDates().size());

        // STEP 3: Subtract initial 1-slot-per-movie
        int remainingSlot = totalSlot - movies.size();
        if (remainingSlot <= 0) {
            movies.forEach(movieRepository::save);
            return;
        }

        // STEP 4: Distribute slots by score
        Map<Movie, Double> movieScores = new HashMap<>();
        for (Movie movie : movies) {
            double ticketPercentage = totalTicketsSold == 0 ? 0.0 :
                    (double) movie.getSeller() / totalTicketsSold;
            double hotPercentage = totalRank == 0 ? 0.0 :
                    (double) movie.getRank() / totalRank;
            double score = ticketPercentage * 0.6 + hotPercentage * 0.4;
            movieScores.put(movie, score);
        }

        double totalScore = movieScores.values().stream().mapToDouble(Double::doubleValue).sum();
        for (Map.Entry<Movie, Double> entry : movieScores.entrySet()) {
            Movie movie = entry.getKey();
            double normalized = totalScore == 0 ? 0 : entry.getValue() / totalScore;
            int extra = (int) Math.round(normalized * remainingSlot);
            movie.setNumberShowtime(movie.getNumberShowtime() + extra);
            movieRepository.save(movie);
        }
        generateAndSaveShowtimes(movies, roomIds, request.getDates());
    }


    private void generateAndSaveShowtimes(List<Movie> movies, List<Integer> roomIds, List<LocalDate> dates) {
        for (Movie movie : movies) {
            int required = movie.getNumberShowtime();
            int assigned = 0;
            int runtime = movie.getRunningTime() ;

            for (LocalDate date : dates) {
                for (Integer roomId : roomIds) {
                    List<LocalTime> existingTimes = showtimeRepository.findTimesByDateAndCinemaRoom(date, roomId);

                    SuggestTimeRequest req = new SuggestTimeRequest();
                    req.setDate(date);
                    req.setCinemaRoomId(roomId);
                    req.setMovieId(movie.getMovieID());

                    List<SuggestShowtimeResponse> suggested = showTimeService.suggestShowTimes(req);

                    for (SuggestShowtimeResponse slot : suggested) {
                        if (assigned >= required) break;

                        Showtime showtime = Showtime.builder()
                                .movie(movie)
                                .cinemaRoom(cinemaRoomRepository.findById(roomId)
                                        .orElseThrow(() -> new AppException(ErrorHandler.CINEMA_ROOM_NOT_FOUND)))
                                .date(date)
                                .time(slot.getStartTime())
                                .version("2D")
                                .active(true)
                                .build();

                        showtimeRepository.save(showtime);
                        assigned++;
                    }

                    if (assigned >= required) break;
                }
                if (assigned >= required) break;
            }

            if (assigned < required) {
                throw new AppException(ErrorHandler.AUTO_CANNOT_CREATE_FULL_SHOWTIME,
                        "Không thể xếp đủ suất chiếu cho phim: " + movie.getTitle());
            }
        }
    }



    public void autoGenerateShowtime(LocalDate date) {
        List<CinemaRoom> allRooms = roomRepository.findAll();

        List<Movie> kidPopular = movieRepository.findByAutoGenre("kidpopular");
        List<Movie> vietnamPopular = movieRepository.findByAutoGenre("vietnampopular");
        List<Movie> comingSoon = movieRepository.findByAutoGenre("coming_soon");
        List<Movie> nonKidPopular = movieRepository.findByAutoGenre("nonkidpopular");
        List<Movie> horror = movieRepository.findByAutoGenre("Horror");

        genreMovieIndexMap.clear();

        Map<Integer, List<CinemaRoom>> groupedByCinema = allRooms.stream()
                .collect(Collectors.groupingBy(room -> room.getCinema().getCinemaID()));

        for (Map.Entry<Integer, List<CinemaRoom>> entry : groupedByCinema.entrySet()) {
            Integer cinemaId = entry.getKey();
            List<CinemaRoom> roomsInCinema = entry.getValue();

            roomsInCinema.sort(Comparator.comparingInt(CinemaRoom::getCinemaRoomID));



            for (int i = 0; i < roomsInCinema.size(); i++) {
                CinemaRoom room = roomsInCinema.get(i);

                    generateShowtimeForPeriod(room, date, LocalTime.of(6, 0), LocalTime.of(10, 0), kidPopular, 2, "kidpopular");
                    generateShowtimeForPeriod(room, date, LocalTime.of(11, 0), LocalTime.of(17, 0), vietnamPopular, 2, "vietnampopular");
                    generateShowtimeForPeriod(room, date, LocalTime.of(18, 0), LocalTime.of(23, 0), nonKidPopular, 2, "nonkidpopular");
                    generateShowtimeForPeriod(room, date, LocalTime.of(0, 0), LocalTime.of(5, 0), horror, 2, "Horror");

            }
        }
    }

    private void generateShowtimeForPeriod(CinemaRoom room, LocalDate date, LocalTime start, LocalTime end,
                                           List<Movie> movies, int slots, String genreKey) {
        if (movies.isEmpty()) return;

        int index = genreMovieIndexMap.getOrDefault(genreKey, 0);
        LocalTime currentTime = start;
        int count = 0;

        while (count < slots) {
            Movie movie = movies.get(index);
            int runtime = movie.getRunningTime() + BUFFER_TIME;

            boolean fitsSlot = (end.isAfter(start) && !currentTime.plusMinutes(runtime).isAfter(end)) ||
                    (!end.isAfter(start) && !currentTime.plusMinutes(runtime).isAfter(LocalTime.of(5, 0)));

            if (!fitsSlot) {
                index = (index + 1) % movies.size();
                if (index == genreMovieIndexMap.getOrDefault(genreKey, 0)) break;
                continue;
            }

            boolean conflict = checkConflict(room, date, currentTime, movie.getRunningTime());
            if (conflict) {
                currentTime = currentTime.plusMinutes(15);
                continue;
            }

            // Tạo showtime
            Showtime showtime = Showtime.builder()
                    .movie(movie)
                    .cinemaRoom(room)
                    .date(date)
                    .time(currentTime)
                    .version(movie.getVersion())
                    .build();

            showtimeRepository.save(showtime);
            currentTime = currentTime.plusMinutes(runtime);
            index = (index + 1) % movies.size();
            count++;
        }

        genreMovieIndexMap.put(genreKey, index);
    }


    private boolean checkConflict(CinemaRoom room, LocalDate date, LocalTime startTime, int runtime) {
        List<Showtime> existingShowtimes = showtimeRepository.findByDateAndCinemaRoom_CinemaRoomID(date, room.getCinemaRoomID());
        LocalTime endTime = startTime.plusMinutes(runtime + BUFFER_TIME);

        for (Showtime existing : existingShowtimes) {
            LocalTime existingStart = existing.getTime();
            LocalTime existingEnd = existingStart.plusMinutes(existing.getMovie().getRunningTime() + BUFFER_TIME);

            if (!(endTime.isBefore(existingStart) || startTime.isAfter(existingEnd))) {
                return true;
            }
        }
        return false;
    }

    private List<Movie> combineGenres(List<Movie> list1, List<Movie> list2) {
        List<Movie> combined = new ArrayList<>();
        combined.addAll(list1);
        combined.addAll(list2);
        return combined;
    }
}


