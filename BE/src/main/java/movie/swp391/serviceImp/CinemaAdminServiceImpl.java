package movie.swp391.serviceImp;

import lombok.RequiredArgsConstructor;
import movie.swp391.entity.Cinema;
import movie.swp391.entity.City;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.repository.CinemaRepository;
import movie.swp391.repository.CityRepository;
import movie.swp391.request.CinemaRequest;
import movie.swp391.response.CinemaAdminResponse;
import movie.swp391.response.CityOptionResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.CinemaAdminService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CinemaAdminServiceImpl implements CinemaAdminService {

    private final CinemaRepository cinemaRepository;
    private final CityRepository cityRepository;

    private CinemaAdminResponse mapToResponse(Cinema cinema) {
        return CinemaAdminResponse.builder()
                .cinemaId(cinema.getCinemaID())
                .name(cinema.getName())
                .address(cinema.getAddress())
                .cityId(cinema.getCity() != null ? cinema.getCity().getCityID() : null)
                .city(cinema.getCity() != null ? cinema.getCity().getName() : null)
                .totalRooms(cinema.getCinemaRooms() != null ? cinema.getCinemaRooms().size() : 0)
                .build();
    }

    @Override
    public BaseResponse<List<CinemaAdminResponse>> getAllCinemas() {
        List<CinemaAdminResponse> response = cinemaRepository.findAll().stream()
                .map(this::mapToResponse)
                .sorted(Comparator.comparing(CinemaAdminResponse::getCinemaId))
                .collect(Collectors.toList());

        return new BaseResponse<>("Successfully retrieved all cinemas", true, response);
    }

    @Override
    @Transactional
    public BaseResponse<CinemaAdminResponse> createCinema(CinemaRequest request) {
        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new AppException(ErrorHandler.INVALID_INPUT, "Thành phố không tồn tại"));

        String normalizedName = request.getName().trim();
        String normalizedAddress = request.getAddress().trim();

        if (cinemaRepository.existsByNameIgnoreCaseAndAddressIgnoreCaseAndCity_CityID(
                normalizedName,
                normalizedAddress,
                city.getCityID())) {
            throw new AppException(ErrorHandler.INVALID_INPUT, "Rạp phim đã tồn tại trong thành phố này");
        }

        Cinema cinema = Cinema.builder()
                .name(normalizedName)
                .address(normalizedAddress)
                .city(city)
                .build();

        Cinema savedCinema = cinemaRepository.save(cinema);
        return new BaseResponse<>("Cinema created successfully", true, mapToResponse(savedCinema));
    }

    @Override
    @Transactional
    public BaseResponse<CinemaAdminResponse> updateCinema(Integer cinemaId, CinemaRequest request) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException(ErrorHandler.CINEMA_NOT_FOUND));

        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new AppException(ErrorHandler.INVALID_INPUT, "Thành phố không tồn tại"));

        String normalizedName = request.getName().trim();
        String normalizedAddress = request.getAddress().trim();

        if (cinemaRepository.existsByNameIgnoreCaseAndAddressIgnoreCaseAndCity_CityIDAndCinemaIDNot(
                normalizedName,
                normalizedAddress,
                city.getCityID(),
                cinemaId)) {
            throw new AppException(ErrorHandler.INVALID_INPUT, "Rạp phim đã tồn tại trong thành phố này");
        }

        cinema.setName(normalizedName);
        cinema.setAddress(normalizedAddress);
        cinema.setCity(city);

        Cinema updatedCinema = cinemaRepository.save(cinema);
        return new BaseResponse<>("Cinema updated successfully", true, mapToResponse(updatedCinema));
    }

    @Override
    @Transactional
    public BaseResponse<String> deleteCinema(Integer cinemaId) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException(ErrorHandler.CINEMA_NOT_FOUND));

        if (cinema.getCinemaRooms() != null && !cinema.getCinemaRooms().isEmpty()) {
            throw new AppException(ErrorHandler.INVALID_INPUT, "Không thể xóa rạp đang có phòng chiếu");
        }

        cinemaRepository.delete(cinema);
        return new BaseResponse<>("Cinema deleted successfully", true, "Deleted cinema with ID " + cinemaId);
    }

    @Override
    public BaseResponse<List<CityOptionResponse>> getAllCities() {
        List<CityOptionResponse> cities = cityRepository.findAll().stream()
                .map(city -> CityOptionResponse.builder()
                        .cityId(city.getCityID())
                        .name(city.getName())
                        .build())
                .sorted(Comparator.comparing(CityOptionResponse::getName, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());

        return new BaseResponse<>("Successfully retrieved all cities", true, cities);
    }
}

