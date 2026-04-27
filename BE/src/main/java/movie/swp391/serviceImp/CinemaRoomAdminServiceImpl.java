package movie.swp391.serviceImp;

import lombok.RequiredArgsConstructor;
import movie.swp391.entity.Cinema;
import movie.swp391.entity.CinemaRoom;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.repository.CinemaRepository;
import movie.swp391.repository.CinemaRoomRepository;
import movie.swp391.repository.ShowtimeRepository;
import movie.swp391.request.CinemaRoomRequest;
import movie.swp391.response.CinemaRoomResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.CinemaRoomAdminService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import movie.swp391.entity.Showtime;

@Service
@RequiredArgsConstructor
public class CinemaRoomAdminServiceImpl implements CinemaRoomAdminService {

    private final CinemaRoomRepository cinemaRoomRepository;
    private final CinemaRepository cinemaRepository;
    private final ShowtimeRepository showtimeRepository;

    private CinemaRoomResponse mapToCinemaRoomResponse(CinemaRoom cinemaRoom) {
        return CinemaRoomResponse.builder()
                .cinemaRoomId(cinemaRoom.getCinemaRoomID())
                .roomName(cinemaRoom.getRoomName())
                .seatQuantity(cinemaRoom.getSeatQuantity())
                .city(cinemaRoom.getCinema() != null && cinemaRoom.getCinema().getCity() != null ? cinemaRoom.getCinema().getCity().getName() : null)
                .address(cinemaRoom.getCinema() != null ? cinemaRoom.getCinema().getAddress() : null)
                .name(cinemaRoom.getCinema() != null ? cinemaRoom.getCinema().getName() : null)
                .cinemaId(cinemaRoom.getCinema() != null ? cinemaRoom.getCinema().getCinemaID() : null)
                .status(cinemaRoom.isActive())
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<List<CinemaRoomResponse>> createCinemaRoom(CinemaRoomRequest request) {
        for (String roomName : request.getRoomName()) {
            if (cinemaRoomRepository.findByRoomName(roomName).isPresent()) {
                return new BaseResponse<>("Cinema room name " + roomName + " already exists", false, null);
            }
        }

        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new AppException(ErrorHandler.CINEMA_NOT_FOUND));

        List<CinemaRoom> createdRooms = new ArrayList<>();
        for (String roomName : request.getRoomName()) {
            CinemaRoom cinemaRoom = CinemaRoom.builder()
                    .roomName(roomName)
                    .seatQuantity(request.getSeatQuantity())
                    .cinema(cinema)
                    .build();
            createdRooms.add(cinemaRoom);
        }

        cinemaRoomRepository.saveAll(createdRooms);

        List<CinemaRoomResponse> responseList = createdRooms.stream()
                .map(this::mapToCinemaRoomResponse)
                .collect(Collectors.toList());

        return new BaseResponse<>("Cinema rooms created successfully", true, responseList);
    }

    @Override
    public BaseResponse<CinemaRoomResponse> getCinemaRoomById(Integer id) {
        CinemaRoom cinemaRoom = cinemaRoomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorHandler.CINEMA_ROOM_NOT_FOUND));
        return new BaseResponse<>("Cinema room retrieved successfully", true, mapToCinemaRoomResponse(cinemaRoom));
    }

    @Override
    public BaseResponse<List<CinemaRoomResponse>> getAllCinemaRooms() {
        List<CinemaRoomResponse> cinemaRooms = cinemaRoomRepository.findAll().stream()
                .map(this::mapToCinemaRoomResponse)
                .collect(Collectors.toList());
        return new BaseResponse<>("Successfully retrieved all cinema rooms", true, cinemaRooms);
    }

    @Override
    @Transactional
    public BaseResponse<CinemaRoomResponse> updateCinemaRoom(Integer id, CinemaRoomRequest request) {
        CinemaRoom cinemaRoom = cinemaRoomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorHandler.CINEMA_ROOM_NOT_FOUND));

        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new AppException(ErrorHandler.CINEMA_NOT_FOUND));

        // Check for future showtimes only, not all showtimes
        List<Showtime> futureShowtimes = showtimeRepository.findFutureShowtimesByCinemaRoom(
                id, java.time.LocalDate.now(), java.time.LocalTime.now()
        );
        if (!futureShowtimes.isEmpty()) {
            throw new AppException(ErrorHandler.SHOWTIME_IN_ACTIVE, "Phòng này đang hoạt động ở tương lai không thể xóa hay cập nhật");
        }

        cinemaRoom.setRoomName(request.getRoomName().get(0));
        cinemaRoom.setSeatQuantity(request.getSeatQuantity());
        cinemaRoom.setCinema(cinema);

        CinemaRoom updatedCinemaRoom = cinemaRoomRepository.save(cinemaRoom);
        return new BaseResponse<>("Cinema room updated successfully", true, mapToCinemaRoomResponse(updatedCinemaRoom));
    }

    @Override
    @Transactional
    public BaseResponse<String> deleteCinemaRoom(Integer id) {
        if (!cinemaRoomRepository.existsById(id)) {
            throw new AppException(ErrorHandler.CINEMA_ROOM_NOT_FOUND);
        }
        // Check for future showtimes only, not all showtimes
        List<Showtime> futureShowtimes = showtimeRepository.findFutureShowtimesByCinemaRoom(
                id, java.time.LocalDate.now(), java.time.LocalTime.now()
        );
        if (!futureShowtimes.isEmpty()) {
            throw new AppException(ErrorHandler.SHOWTIME_IN_ACTIVE, "Phòng này đang hoạt động ở tương lai không thể xóa hay cập nhật");
        }
        cinemaRoomRepository.deleteById(id);
        return new BaseResponse<>("Cinema room deleted successfully", true, "Cinema room with ID " + id + " deleted.");
    }
    @Override
    @Transactional
    public BaseResponse<CinemaRoomResponse> setActiveStatus(Integer id, boolean active) {
        CinemaRoom cinemaRoom = cinemaRoomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorHandler.CINEMA_ROOM_NOT_FOUND));
        // Lấy showtime còn trong tương lai
        List<Showtime> futureShowtimes = showtimeRepository.findFutureShowtimesByCinemaRoom(
                id, java.time.LocalDate.now(), java.time.LocalTime.now()
        );
        if (!futureShowtimes.isEmpty()) {
            throw new AppException(ErrorHandler.SHOWTIME_IN_ACTIVE);
        }
        cinemaRoom.setActive(active);
        cinemaRoomRepository.save(cinemaRoom);
        return new BaseResponse<>("Cập nhật trạng thái phòng thành công", true, mapToCinemaRoomResponse(cinemaRoom));
    }
}
