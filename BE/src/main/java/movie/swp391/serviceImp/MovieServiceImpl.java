package movie.swp391.serviceImp;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.*;
import movie.swp391.entity.Movie;
import movie.swp391.entity.MovieStatusPeriod;
import movie.swp391.entity.Showtime;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.mapper.*;
import movie.swp391.repository.*;
import movie.swp391.mapper.MovieMapper;
import movie.swp391.mapper.MovieStatusPeriodMapper;
import movie.swp391.repository.MovieRepository;
import movie.swp391.repository.MovieStatusPeriodRepository;
import movie.swp391.repository.ShowtimeRepository;
import movie.swp391.request.MovieAutoRequest;
import movie.swp391.request.MovieRequest;
import movie.swp391.request.MovieStatusPeriodRequest;
import movie.swp391.response.*;
import movie.swp391.response.MovieResponse;
import movie.swp391.response.MovieStatusPeriodResponse;
import movie.swp391.service.MovieService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class MovieServiceImpl implements MovieService {

    MovieRepository movieRepository;
    MovieMapper movieMapper;
    MovieStatusPeriodRepository movieStatusPeriodRepository;
    MovieStatusPeriodMapper movieStatusPeriodMapper;
    ShowtimeRepository showtimeRepository;

    private static final Logger log = LoggerFactory.getLogger(MovieServiceImpl.class);

    @Override
    public List<MovieResponse> getAllMovies() {
        List<Movie> allMovies = movieRepository.findAll();
        for (Movie movie : allMovies) {
            syncMovieStatusPeriodByShowtimes(movie.getMovieID());
        }

        List<MovieResponse> movies = movieRepository.findAll().stream()
                .map(this::toDerivedMovieResponse)
                .toList();
        if (movies.isEmpty()) throw new AppException(ErrorHandler.LIST_EMPTY);
        return movies;
    }

    private MovieResponse toDerivedMovieResponse(Movie movie) {
        MovieResponse response = movieMapper.toMovieResponse(movie);
        List<Showtime> showtimes = movie.getShowtimes();

        if (showtimes == null || showtimes.isEmpty()) {
            response.setFromDate(null);
            response.setToDate(null);
            response.setStatus("No Schedule");
            return response;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime comingSoonThreshold = now.plusDays(7);
        boolean hasPast = false;
        boolean hasFuture = false;
        LocalDateTime earliestFutureShowtime = null;

        LocalDate firstDate = null;
        LocalDate latestDate = null;

        for (Showtime showtime : showtimes) {
            LocalDate showDate = showtime.getDate();
            LocalDateTime showDateTime = LocalDateTime.of(showtime.getDate(), showtime.getTime());

            if (showDateTime.isBefore(now)) {
                hasPast = true;
            } else if (showDateTime.isAfter(now)) {
                hasFuture = true;
                if (earliestFutureShowtime == null || showDateTime.isBefore(earliestFutureShowtime)) {
                    earliestFutureShowtime = showDateTime;
                }
            }

            if (firstDate == null || showDate.isBefore(firstDate)) {
                firstDate = showDate;
            }
            if (latestDate == null || showDate.isAfter(latestDate)) {
                latestDate = showDate;
            }
        }

        response.setFromDate(firstDate);
        response.setToDate(latestDate);

        if (hasPast && !hasFuture) {
            response.setStatus("Ended");
        } else if (!hasPast && hasFuture
                && earliestFutureShowtime != null
                && (earliestFutureShowtime.isEqual(comingSoonThreshold) || earliestFutureShowtime.isAfter(comingSoonThreshold))) {
            response.setStatus("Coming Soon");
        } else {
            response.setStatus("Now Showing");
        }

        return response;
    }

    @Override
    public MovieResponse createMovie(MovieRequest request) {

        Movie movie = movieMapper.toMovie(request);
        if (movieRepository.existsMoviesByTitleAndPoster(request.getTitle(), request.getPoster()))
            throw new AppException(ErrorHandler.MOVIE_EXIST);
        else movieRepository.save(movie);
        return movieMapper.toMovieResponse(movie);

    }
    @Override
    public MovieResponse createAutoMovie(MovieAutoRequest request) {

        Movie movie = movieMapper.toMovieAuto(request);
        if (movieRepository.existsMoviesByTitleAndPoster(request.getTitle(), request.getPoster()))
            throw new AppException(ErrorHandler.MOVIE_EXIST);

        else movieRepository.save(movie);
        return movieMapper.toMovieResponse(movie);

    }

    @Override
    public MovieResponse updateMovie(Integer movieId, MovieRequest request) {

        Movie movie = movieRepository.findById(movieId).orElseThrow(() -> new AppException(ErrorHandler.MOVIE_NOT_EXISTED));
        if (movieRepository.existsMoviesByTitleAndPosterAndMovieIDNot(request.getTitle(), request.getVersion(), movieId))
            throw new AppException(ErrorHandler.MOVIE_EXIST);
        movieMapper.updateMovie(movie, request);

        return movieMapper.toMovieResponse(movieRepository.save(movie));

    }

    @Override
    public void deleteMovie(Integer movieId) {

        Movie movie = movieRepository.findById(movieId).orElseThrow(() -> new AppException(ErrorHandler.MOVIE_NOT_EXISTED));
        List<Showtime> showtimes = showtimeRepository.findAllByMovie_MovieID(movieId);
        if (!showtimes.isEmpty()){
            throw new AppException(ErrorHandler.MOVIE_IN_SHOWTIME,"Phim này đang tồn tại trong 1 suất nào đó đảm bảo xóa suất đó trước");

        }
        if (movie.getActive()){
            throw new AppException(ErrorHandler.MOVIE_IN_ACTIVE);
        }
        if(movie.getMovieStatusPeriod() != null){
            movie.setMovieStatusPeriod(null);
            movieRepository.save(movie);
        }


        movieRepository.deleteById(movieId);
    }
    @Override
    public List<MovieStatusPeriodResponse> getALlDate(){
        List<MovieStatusPeriodResponse> date = movieStatusPeriodRepository.findAll().stream().map(movieStatusPeriodMapper::toMovieStatusPeriodResponse).toList();
        if (date.isEmpty()) throw new AppException(ErrorHandler.LIST_EMPTY);
        return date;
    }
    @Override
    public MovieStatusPeriodResponse createDate(MovieStatusPeriodRequest request){
        MovieStatusPeriod movieStatusPeriod = movieStatusPeriodMapper.toMovieStatusPeriod(request);
        if (movieStatusPeriodRepository.existsMovieStatusPeriodByFromDateAndToDate(request.getFromDate(),request.getToDate())) throw new AppException(ErrorHandler.DATE_EXIST);
        movieStatusPeriodRepository.save(movieStatusPeriod);
        return movieStatusPeriodMapper.toMovieStatusPeriodResponse(movieStatusPeriod);
    }
    @Override
    public MovieStatusPeriodResponse updateDate(Long id,MovieStatusPeriodRequest request){
        MovieStatusPeriod msp = movieStatusPeriodRepository.findById(id).orElseThrow(() -> new AppException(ErrorHandler.DATE_NOT_EXIST));
        if (movieStatusPeriodRepository.existsMovieStatusPeriodByFromDateAndToDate(request.getFromDate(),request.getToDate())) throw new AppException(ErrorHandler.DATE_EXIST);

        movieStatusPeriodMapper.updateMovieStatusPeriod(msp, request);

        return movieStatusPeriodMapper.toMovieStatusPeriodResponse(movieStatusPeriodRepository.save(msp));
    }

    @Override
    public void deleteDate(Long id) {
        List<Movie> movies = movieRepository.findByMovieStatusPeriod_Id((id));
        if (!movies.isEmpty()) {
            for (Movie movie : movies) {
                movie.setMovieStatusPeriod(null);
            }
            movieRepository.saveAll(movies);
        }
        movieStatusPeriodRepository.deleteById(id);
    }

    @Override
    public void turnOnOffMovie(List<Integer> movieId){
        List<Movie> movies = movieRepository.findAllById(movieId);

        for (Movie movie : movies) {
            if (movie.getActive()) {
                if (checkIfMovieInShowTimeAfterDay(movie.getMovieID())) {
                    String mess = "Phim " + movie.getTitle() + " đang tồn tại trong giờ chiếu ở tương lai, không thể tắt hoạt động.";
                    throw new AppException(ErrorHandler.MOVIE_IN_SHOWTIME, mess);
                }
            }
        }
        for (Movie movie : movies) {
            movie.setActive(!movie.getActive());
        }
        movieRepository.saveAll(movies);
    }

    public void setDateForMovie(List<Integer> movieId, Long id ){
        MovieStatusPeriod movieStatusPeriod = movieStatusPeriodRepository.findById(id).orElseThrow(() -> new AppException(ErrorHandler.MOVIE_STATUS_NOT_EXIST));
        List<Movie> movies = movieRepository.findAllById(movieId);
        List<Movie> moviesDate = movieRepository.findByMovieStatusPeriod_Id(id);
        
        // Set movieStatusPeriod cho những movie được chọn
        for (Movie movie : movies) {
            movie.setMovieStatusPeriod(movieStatusPeriod);
        }
        movieRepository.saveAll(movies);
        
        // Set movieStatusPeriod = null cho những movie khác trong cùng period
        List<Movie> moviesToSetNull = moviesDate.stream()
                .filter(movie -> !movieId.contains(movie.getMovieID()))
                .collect(Collectors.toList());
        
        for (Movie movie : moviesToSetNull) {
            movie.setMovieStatusPeriod(null);
        }
        movieRepository.saveAll(moviesToSetNull);
    }




    public boolean checkIfMovieInShowTimeAfterDay(Integer movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new AppException(ErrorHandler.MOVIE_NOT_EXISTED));

        LocalDateTime now = LocalDateTime.now();

        return movie.getShowtimes().stream()
                .anyMatch(showtime -> {
                    LocalDateTime showtimeDateTime = LocalDateTime.of(showtime.getDate(), showtime.getTime());
                    return showtimeDateTime.isAfter(now.plusMinutes(movie.getRunningTime()));
                });

    }

    @Override
    @Transactional
    public void syncMovieStatusPeriodByShowtimes(Integer movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new AppException(ErrorHandler.MOVIE_NOT_EXISTED));

        Optional<Showtime> latestShowtimeOpt = showtimeRepository.findTopByMovie_MovieIDOrderByDateDescTimeDesc(movieId);
        if (latestShowtimeOpt.isEmpty()) {
            if (movie.getMovieStatusPeriod() != null) {
                movie.setMovieStatusPeriod(null);
                movieRepository.save(movie);
            }
            return;
        }

        LocalDate latestDate = latestShowtimeOpt.get().getDate();
        LocalDate firstDate = showtimeRepository.findTopByMovie_MovieIDOrderByDateAscTimeAsc(movieId)
                .map(Showtime::getDate)
                .orElse(latestDate);

        MovieStatusPeriod period = movie.getMovieStatusPeriod();
        boolean changed = false;

        if (period == null) {
            period = new MovieStatusPeriod();
            period.setFromDate(firstDate);
            period.setToDate(latestDate);
            movie.setMovieStatusPeriod(period);
            changed = true;
        } else {
            // A period can be shared by multiple movies; clone it so syncing one movie does not overwrite others.
            if (period.getMovies() != null && period.getMovies().stream().anyMatch(m -> !m.getMovieID().equals(movieId))) {
                MovieStatusPeriod cloned = new MovieStatusPeriod();
                cloned.setFromDate(period.getFromDate());
                cloned.setToDate(period.getToDate());
                movie.setMovieStatusPeriod(cloned);
                period = cloned;
                changed = true;
            }

            if (period.getFromDate() == null || period.getFromDate().isAfter(firstDate)) {
                period.setFromDate(firstDate);
                changed = true;
            }

            if (period.getToDate() == null || !period.getToDate().equals(latestDate)) {
                period.setToDate(latestDate);
                changed = true;
            }
        }

        if (changed) {
            movieRepository.save(movie);
        }
    }

    @Scheduled(fixedRate = 300000)
    @Transactional
    public void syncAllMovieStatusPeriodsByShowtimes() {
        movieRepository.findAll().forEach(movie -> {
            try {
                syncMovieStatusPeriodByShowtimes(movie.getMovieID());
            } catch (Exception ex) {
                log.warn("Failed to sync movie status period for movieID={}: {}", movie.getMovieID(), ex.getMessage());
            }
        });
    }









}


