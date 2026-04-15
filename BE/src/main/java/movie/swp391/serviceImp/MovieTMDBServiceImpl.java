package movie.swp391.serviceImp;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.Movie;
import movie.swp391.entity.MovieStatusPeriod;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.mapper.*;
import movie.swp391.repository.*;
import movie.swp391.mapper.MovieMapper;
import movie.swp391.repository.MovieRepository;
import movie.swp391.repository.MovieStatusPeriodRepository;
import movie.swp391.request.MovieAutoRequest;
import movie.swp391.request.MovieRequest;
import movie.swp391.response.MovieTMDBSearchResponse;
import movie.swp391.service.MovieService;
import movie.swp391.service.MovieTMDBService;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class MovieTMDBServiceImpl implements MovieTMDBService {
    private static class MovieWithPopularity {
        Movie movie;
        double popularity;

        public MovieWithPopularity(Movie movie, double popularity) {
            this.movie = movie;
            this.popularity = popularity;
        }
    }
    public static final Logger log = LoggerFactory.getLogger(MovieTMDBServiceImpl.class);
    public final String API_KEY = "5ba936eb306de9a784c6d6bf14a744c7";
    public final String BASE_URL_LIST = "https://api.themoviedb.org/3/search/movie";
    public final String BASE_URL_ID = "https://api.themoviedb.org/3/movie/";
    public final String IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
    RestTemplate restTemplate;
    MovieService movieService;
    private final MovieStatusPeriodRepository movieStatusPeriodRepository;
    MovieRepository movieRepository;
    MovieMapper movieMapper;


    @Scheduled(fixedRate = 864000)
    @Transactional
    public void updateMovieRanksBasedOnTMDB() {
        List<Movie> movies = movieRepository.findAll();
        if (movies.isEmpty()) return;

        List<MovieWithPopularity> rankedMovies = new ArrayList<>();

        for (Movie movie : movies) {
            try {
                String searchUrl = BASE_URL_LIST + "?query=" + URLEncoder.encode(movie.getTitle(), StandardCharsets.UTF_8) + "&language=vi-VN&api_key=" + API_KEY;
                String json = restTemplate.getForObject(searchUrl, String.class);
                JSONObject obj = new JSONObject(json);
                JSONArray results = obj.getJSONArray("results");

                if (results.length() > 0) {
                    JSONObject firstMatch = results.getJSONObject(0);
                    double popularity = firstMatch.optDouble("popularity", 0.0); // hoặc dùng vote_average nếu bạn thích
                    rankedMovies.add(new MovieWithPopularity(movie, popularity));
                }
            } catch (Exception e) {
                log.warn("Failed to fetch TMDB data for movie: " + movie.getTitle(), e);
            }
        }

        rankedMovies.sort((a, b) -> Double.compare(b.popularity, a.popularity));

        for (int i = 0; i < rankedMovies.size(); i++) {
            Movie movie = rankedMovies.get(i).movie;
            movie.setRank(i + 1); // xếp hạng bắt đầu từ 1
            movieRepository.save(movie); // lưu lại
        }

        log.info("Cập nhật xếp hạng TMDB hoàn tất.");
    }


    public List<MovieTMDBSearchResponse> searchMoviesTMDB(String movieName) {
        List<MovieTMDBSearchResponse> results = new ArrayList<>();
        String url = BASE_URL_LIST + "?query=" + movieName + "&language=vi-VN&api_key=" + API_KEY;

        String json;
        JSONArray movies;
        JSONObject obj;

        try {
            json = this.restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            throw new AppException(ErrorHandler.TMDB_API_UNAVAILABLE);
        }

        try {
            obj = new JSONObject(json);
            movies = obj.getJSONArray("results");
        } catch (JSONException e) {
            throw new AppException(ErrorHandler.INVALID_TMDB_RESPONSE);
        }

        for (int i = 0; i < movies.length(); i++) {
            JSONObject movie = movies.getJSONObject(i);
            String title = movie.optString("title");
            Integer movieId = movie.optInt("id");
            String overview = movie.optString("overview");
            String posterPath = movie.optString("poster_path");
            String posterUrl = (posterPath != null && !posterPath.isEmpty()) ? IMAGE_BASE + posterPath : null;
            results.add(new MovieTMDBSearchResponse(movieId,title, overview, posterUrl));
        }

        return results;
    }
    @Override
    public MovieRequest getMovieDetails(Integer movieId) {
        String url = BASE_URL_ID + movieId + "?api_key=" + API_KEY + "&append_to_response=videos,credits,release_dates";

        String json;
        JSONObject movie;

        try {
            json = restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            throw new AppException(ErrorHandler.TMDB_API_UNAVAILABLE);
        }

        try {
            movie = new JSONObject(json);
        } catch (JSONException e) {
            throw new AppException(ErrorHandler.INVALID_TMDB_RESPONSE);
        }

        StringBuilder actors = new StringBuilder();
        JSONArray castArray = movie.optJSONObject("credits") != null ? movie.getJSONObject("credits").optJSONArray("cast") : null;
        if (castArray != null) {
            for (int i = 0; i < Math.min(castArray.length(), 3); i++) { // Lấy 3 diễn viên đầu
                JSONObject cast = castArray.getJSONObject(i);
                actors.append(cast.optString("name"));
                if (i < Math.min(castArray.length(), 3) - 1) actors.append(", ");
            }
        }

        String director = "";
        JSONArray crewArray = movie.optJSONObject("credits") != null ? movie.getJSONObject("credits").optJSONArray("crew") : null;
        if (crewArray != null) {
            for (int i = 0; i < crewArray.length(); i++) {
                JSONObject crew = crewArray.getJSONObject(i);
                if ("Director".equalsIgnoreCase(crew.optString("job"))) {
                    director = crew.optString("name");
                    break;
                }
            }
        }


        String trailer = "https://www.youtube.com/watch?v=";
        JSONArray videos = movie.optJSONObject("videos") != null ? movie.getJSONObject("videos").optJSONArray("results") : null;
        if (videos != null) {
            for (int i = 0; i < videos.length(); i++) {
                JSONObject video = videos.getJSONObject(i);
                if ("Trailer".equalsIgnoreCase(video.optString("type"))) {
                    trailer = trailer+ video.optString("key");
                    break;
                }
            }
        }

        String productionCompany = "";
        JSONArray companies = movie.optJSONArray("production_companies");
        if (companies != null && companies.length() > 0) {
            productionCompany = companies.getJSONObject(0).optString("name");
        }

        String genre = "";
        JSONArray genres = movie.optJSONArray("genres");
        if (genres != null && genres.length() > 0) {
            genre = genres.getJSONObject(0).optString("name");
        }

        String language = "";
        JSONArray languages = movie.optJSONArray("spoken_languages");
        if (languages != null && languages.length() > 0) {
            language = languages.getJSONObject(0).optString("name");
        }

        String ageRating = "";
        JSONArray releaseResults = movie.optJSONObject("release_dates") != null
                ? movie.getJSONObject("release_dates").optJSONArray("results")
                : null;
        if (releaseResults != null && releaseResults.length() > 0) {
            JSONArray innerReleaseDates = releaseResults.getJSONObject(0).optJSONArray("release_dates");
            if (innerReleaseDates != null && innerReleaseDates.length() > 0) {
                ageRating = innerReleaseDates.getJSONObject(0).optString("certification");
            }
        }

        LocalDate releaseDate = null;
        String releaseDateStr = movie.optString("release_date");
        if (releaseDateStr != null && !releaseDateStr.isEmpty()) {
            releaseDate = LocalDate.parse(releaseDateStr);
        }

        String posterPath = movie.optString("poster_path");
        String poster = (posterPath != null && !posterPath.isEmpty()) ? IMAGE_BASE + posterPath : null;

        return new MovieRequest(
                movie.optString("title"),
                actors.toString(),
                director,
                productionCompany,
                movie.optString("runtime"),
                "",
                trailer,
                movie.optString("overview"),
                poster,
                genre,
                language,
                ageRating,
                releaseDate
        );
    }

    public List<Integer> getTop10PopularNonKidsMovieIds() {
        String url = "https://api.themoviedb.org/3/discover/movie"
                + "?api_key=" + API_KEY
                + "&language=en-US"
                + "&sort_by=popularity.desc"
                + "&certification_country=US"
                + "&certification.gte=PG-13"
                + "&page=1";

        String json;

        try {
            json = restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            throw new AppException(ErrorHandler.TMDB_API_UNAVAILABLE);
        }

        JSONObject response;
        try {
            response = new JSONObject(json);
        } catch (JSONException e) {
            throw new AppException(ErrorHandler.INVALID_TMDB_RESPONSE);
        }

        JSONArray results = response.optJSONArray("results");
        if (results == null) return Collections.emptyList();

        List<Integer> movieIds = new ArrayList<>();
        for (int i = 0; i < Math.min(results.length(), 10); i++) {
            JSONObject movieObj = results.getJSONObject(i);
            movieIds.add(movieObj.optInt("id"));
        }

        return movieIds;
    }
    public void importMoviesFromTMDB() {
        List<Integer> popularNonKidsMovieIdsIds = getTop10PopularNonKidsMovieIds();
        List<Integer> kidsMovieIds = getTop5AnimationForKidsMovieIds();
        List<Integer> comingSoonMovieIds = getComingSoonMovieIds();
        List<Integer> vietNamMovieIds = getTop5VietNamMovieIds();
        List<Integer> horrorMovieIds = getTopHorrorMovieIds();



        LocalDate fromDate = LocalDate.now();
        LocalDate toDate = fromDate.plusWeeks(2);

        for (Integer id : popularNonKidsMovieIdsIds) {
            MovieAutoRequest movieRequest = getMovieDetailsFromTMDB(id);
            if( isMovieAlreadyImported(movieRequest.getTitle(),movieRequest.getPoster(),id)) continue;
            movieRequest.setAutoGenre("nonkidpopular");
            Movie movie = movieMapper.toMovieAuto(movieRequest);

            MovieStatusPeriod period = movieStatusPeriodRepository
                    .findByFromDateAndToDate(fromDate, toDate)
                    .orElseGet(() -> {
                        MovieStatusPeriod newPeriod = new MovieStatusPeriod();
                        newPeriod.setFromDate(fromDate);
                        newPeriod.setToDate(toDate);

                        return movieStatusPeriodRepository.save(newPeriod);
                    });

            movie.setMovieStatusPeriod(period);

            movieRepository.save(movie);
        }
        for (Integer id : kidsMovieIds) {
            MovieAutoRequest movieRequest = getMovieDetailsFromTMDB(id);
            if( isMovieAlreadyImported(movieRequest.getTitle(),movieRequest.getPoster(),id)) continue;

            movieRequest.setAutoGenre("kidpopular");
            Movie movie = movieMapper.toMovieAuto(movieRequest);

            MovieStatusPeriod period = movieStatusPeriodRepository
                    .findByFromDateAndToDate(fromDate, toDate)
                    .orElseGet(() -> {
                        MovieStatusPeriod newPeriod = new MovieStatusPeriod();
                        newPeriod.setFromDate(fromDate);
                        newPeriod.setToDate(toDate);

                        return movieStatusPeriodRepository.save(newPeriod);
                    });

            movie.setMovieStatusPeriod(period);

            movieRepository.save(movie);
        }
        for (Integer id : vietNamMovieIds) {
            MovieAutoRequest movieRequest = getMovieDetailsFromTMDB(id);
            if( isMovieAlreadyImported(movieRequest.getTitle(),movieRequest.getPoster(),id)) continue;

            movieRequest.setAutoGenre("vietnampopular");
            Movie movie = movieMapper.toMovieAuto(movieRequest);

            MovieStatusPeriod period = movieStatusPeriodRepository
                    .findByFromDateAndToDate(fromDate, toDate)
                    .orElseGet(() -> {
                        MovieStatusPeriod newPeriod = new MovieStatusPeriod();
                        newPeriod.setFromDate(fromDate);
                        newPeriod.setToDate(toDate);

                        return movieStatusPeriodRepository.save(newPeriod);
                    });

            movie.setMovieStatusPeriod(period);

            movieRepository.save(movie);
        }
        for (Integer id : comingSoonMovieIds) {
            MovieAutoRequest movieRequest = getMovieDetailsFromTMDB(id);
            if( isMovieAlreadyImported(movieRequest.getTitle(),movieRequest.getPoster(),id)) continue;

            movieRequest.setAutoGenre("coming_soon");
            Movie movie = movieMapper.toMovieAuto(movieRequest);

            MovieStatusPeriod period = movieStatusPeriodRepository
                    .findByFromDateAndToDate(fromDate, toDate)
                    .orElseGet(() -> {
                        MovieStatusPeriod newPeriod = new MovieStatusPeriod();
                        newPeriod.setFromDate(fromDate);
                        newPeriod.setToDate(toDate);

                        return movieStatusPeriodRepository.save(newPeriod);
                    });

            movie.setMovieStatusPeriod(period);

            movieRepository.save(movie);
        }
        for (Integer id : horrorMovieIds) {
            MovieAutoRequest movieRequest = getMovieDetailsFromTMDB(id);
            if( isMovieAlreadyImported(movieRequest.getTitle(),movieRequest.getPoster(),id)) continue;

            movieRequest.setAutoGenre("Horror");
            Movie movie = movieMapper.toMovieAuto(movieRequest);

            MovieStatusPeriod period = movieStatusPeriodRepository
                    .findByFromDateAndToDate(fromDate, toDate)
                    .orElseGet(() -> {
                        MovieStatusPeriod newPeriod = new MovieStatusPeriod();
                        newPeriod.setFromDate(fromDate);
                        newPeriod.setToDate(toDate);

                        return movieStatusPeriodRepository.save(newPeriod);
                    });

            movie.setMovieStatusPeriod(period);

            movieRepository.save(movie);
        }
    }


    public MovieAutoRequest getMovieDetailsFromTMDB(Integer movieId) {
        String url = BASE_URL_ID + movieId + "?api_key=" + API_KEY + "&append_to_response=videos,credits,release_dates";

        String json;
        JSONObject movie;

        try {
            json = restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            throw new AppException(ErrorHandler.TMDB_API_UNAVAILABLE);
        }

        try {
            movie = new JSONObject(json);
        } catch (JSONException e) {
            throw new AppException(ErrorHandler.INVALID_TMDB_RESPONSE);
        }

        StringBuilder actors = new StringBuilder();
        JSONArray castArray = movie.optJSONObject("credits") != null ? movie.getJSONObject("credits").optJSONArray("cast") : null;
        if (castArray != null) {
            for (int i = 0; i < Math.min(castArray.length(), 3); i++) {
                JSONObject cast = castArray.getJSONObject(i);
                actors.append(cast.optString("name"));
                if (i < Math.min(castArray.length(), 3) - 1) actors.append(", ");
            }
        }

        String director = "";
        JSONArray crewArray = movie.optJSONObject("credits") != null ? movie.getJSONObject("credits").optJSONArray("crew") : null;
        if (crewArray != null) {
            for (int i = 0; i < crewArray.length(); i++) {
                JSONObject crew = crewArray.getJSONObject(i);
                if ("Director".equalsIgnoreCase(crew.optString("job"))) {
                    director = crew.optString("name");
                    break;
                }
            }
        }

        String trailer = "https://www.youtube.com/watch?v=";
        JSONArray videos = movie.optJSONObject("videos") != null ? movie.getJSONObject("videos").optJSONArray("results") : null;
        if (videos != null) {
            for (int i = 0; i < videos.length(); i++) {
                JSONObject video = videos.getJSONObject(i);
                if ("Trailer".equalsIgnoreCase(video.optString("type"))) {
                    trailer += video.optString("key");
                    break;
                }
            }
        }

        String productionCompany = "";
        JSONArray companies = movie.optJSONArray("production_companies");
        if (companies != null && companies.length() > 0) {
            productionCompany = companies.getJSONObject(0).optString("name");
        }

        String genre = "";
        JSONArray genres = movie.optJSONArray("genres");
        if (genres != null && genres.length() > 0) {
            genre = genres.getJSONObject(0).optString("name");
        }

        String language = "";
        JSONArray languages = movie.optJSONArray("spoken_languages");
        if (languages != null && languages.length() > 0) {
            language = languages.getJSONObject(0).optString("name");
        }

        String ageRating = "";
        JSONArray releaseResults = movie.optJSONObject("release_dates") != null
                ? movie.getJSONObject("release_dates").optJSONArray("results")
                : null;
        if (releaseResults != null && releaseResults.length() > 0) {
            JSONArray innerReleaseDates = releaseResults.getJSONObject(0).optJSONArray("release_dates");
            if (innerReleaseDates != null && innerReleaseDates.length() > 0) {
                ageRating = innerReleaseDates.getJSONObject(0).optString("certification");
            }
        }

        LocalDate releaseDate = null;
        String releaseDateStr = movie.optString("release_date");
        if (releaseDateStr != null && !releaseDateStr.isEmpty()) {
            releaseDate = LocalDate.parse(releaseDateStr);
        }

        String posterPath = movie.optString("poster_path");
        String poster = (posterPath != null && !posterPath.isEmpty()) ? IMAGE_BASE + posterPath : null;

        return MovieAutoRequest.builder()
                .title(movie.optString("title"))
                .actors(actors.toString())
                .director(director)
                .productionCompany(productionCompany)
                .runningTime(movie.opt("runtime") != null ? movie.opt("runtime").toString() : "")
                .trailer(trailer)
                .content(movie.optString("overview"))
                .poster(poster)
                .genre(genre)
                .language(language)
                .ageRating(ageRating)
                .releaseDate(releaseDate)
                .build();
    }
    public List<Integer> getComingSoonMovieIds() {
        String url = "https://api.themoviedb.org/3/movie/upcoming?api_key=" + API_KEY + "&language=en-US&page=1";
        String json;

        try {
            json = restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            throw new AppException(ErrorHandler.TMDB_API_UNAVAILABLE);
        }

        JSONObject response;
        try {
            response = new JSONObject(json);
        } catch (JSONException e) {
            throw new AppException(ErrorHandler.INVALID_TMDB_RESPONSE);
        }

        JSONArray results = response.optJSONArray("results");
        if (results == null) return Collections.emptyList();

        List<Integer> movieIds = new ArrayList<>();
        for (int i = 0; i < Math.min(results.length(), 10); i++) {
            JSONObject movieObj = results.getJSONObject(i);
            movieIds.add(movieObj.optInt("id"));
        }

        return movieIds;
    }

    public List<Integer> getTop5VietNamMovieIds() {
        String url = "https://api.themoviedb.org/3/discover/movie?api_key=" + API_KEY +
                "&sort_by=popularity.desc&with_original_language=vi&page=1";

        String json;
        try {
            json = restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            throw new AppException(ErrorHandler.TMDB_API_UNAVAILABLE);
        }

        JSONObject response;
        try {
            response = new JSONObject(json);
        } catch (JSONException e) {
            throw new AppException(ErrorHandler.INVALID_TMDB_RESPONSE);
        }

        JSONArray results = response.optJSONArray("results");
        if (results == null) return Collections.emptyList();

        List<Integer> movieIds = new ArrayList<>();
        for (int i = 0; i < Math.min(results.length(), 5); i++) {
            JSONObject movieObj = results.getJSONObject(i);
            movieIds.add(movieObj.optInt("id"));
        }

        return movieIds;
    }


    public List<Integer> getTop5AnimationForKidsMovieIds() {
        String url = "https://api.themoviedb.org/3/discover/movie?api_key=" + API_KEY
                + "&with_genres=16"
                + "&certification_country=US"
                + "&certification.lte=G"
                + "&sort_by=popularity.desc"
                + "&language=en-US&page=1";

        String json;
        try {
            json = restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            throw new AppException(ErrorHandler.TMDB_API_UNAVAILABLE);
        }

        JSONObject response;
        try {
            response = new JSONObject(json);
        } catch (JSONException e) {
            throw new AppException(ErrorHandler.INVALID_TMDB_RESPONSE);
        }

        JSONArray results = response.optJSONArray("results");
        if (results == null) return Collections.emptyList();

        List<Integer> movieIds = new ArrayList<>();
        for (int i = 0; i < Math.min(results.length(), 5); i++) {
            JSONObject movieObj = results.getJSONObject(i);
            movieIds.add(movieObj.optInt("id"));
        }

        return movieIds;
    }
    public List<Integer> getTopHorrorMovieIds() {
        String url = "https://api.themoviedb.org/3/discover/movie" +
                "?api_key=" + API_KEY +
                "&with_genres=27" +
                "&sort_by=popularity.desc" +
                "&language=en-US" +
                "&page=1";

        String json;
        try {
            json = restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            throw new AppException(ErrorHandler.TMDB_API_UNAVAILABLE);
        }

        JSONObject response;
        try {
            response = new JSONObject(json);
        } catch (JSONException e) {
            throw new AppException(ErrorHandler.INVALID_TMDB_RESPONSE);
        }

        JSONArray results = response.optJSONArray("results");
        if (results == null) return Collections.emptyList();

        List<Integer> movieIds = new ArrayList<>();
        for (int i = 0; i < Math.min(results.length(), 5); i++) {
            JSONObject movieObj = results.getJSONObject(i);
            movieIds.add(movieObj.optInt("id"));
        }

        return movieIds;
    }

    public boolean isMovieAlreadyImported(String title, String poster, Integer movieId) {
        return movieRepository.existsMoviesByTitleAndPosterAndMovieIDNot(title, poster, movieId);
    }

}











