package movie.swp391.serviceImp;

import lombok.RequiredArgsConstructor;
import movie.swp391.entity.Cinema;
import movie.swp391.repository.CinemaRepository;
import movie.swp391.response.CinemaResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.CinemaService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CinemaServiceImpl implements CinemaService {

    private final CinemaRepository cinemaRepository;

    @Override
    public BaseResponse<List<CinemaResponse>> getAllCinemas() {
        List<Cinema> cinemas = cinemaRepository.findAll();
        List<CinemaResponse> cinemaResponses = cinemas.stream()
                .map(cinema -> CinemaResponse.builder()
                        .cinemaId(cinema.getCinemaID())
                        .name(cinema.getName())
                        .address(cinema.getAddress())
                        .city(cinema.getCity() != null ? cinema.getCity().getName() : null)
                        .build())
                .collect(Collectors.toList());
        return new BaseResponse<>("Successfully retrieved all cinemas", true, cinemaResponses);
    }
} 