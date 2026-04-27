package movie.swp391.serviceImp;

import lombok.RequiredArgsConstructor;
import movie.swp391.entity.CinemaRoom;
import movie.swp391.repository.CinemaRoomRepository;
import movie.swp391.response.CinemaRoomResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.CinemaRoomService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CinemaRoomServiceImpl implements CinemaRoomService {

    private final CinemaRoomRepository cinemaRoomRepository;

    @Override
    public BaseResponse<List<CinemaRoomResponse>> getAllCinemaRooms() {
        List<CinemaRoom> cinemaRooms = cinemaRoomRepository.findAll();
        List<CinemaRoomResponse> responses = cinemaRooms.stream()
                .map(room -> CinemaRoomResponse.builder()
                        .cinemaRoomId(room.getCinemaRoomID())
                        .roomName(room.getRoomName())
                        .seatQuantity(room.getSeatQuantity())
                        .address(room.getCinema() != null ? room.getCinema().getAddress() : null)
                        .name(room.getCinema() != null ? room.getCinema().getName() : null)
                        .city(room.getCinema() != null && room.getCinema().getCity() != null ? room.getCinema().getCity().getName() : null)
                        .cinemaId(room.getCinema() != null ? room.getCinema().getCinemaID() : null)
                        .build())
                .collect(Collectors.toList());
        return new BaseResponse<>("Successfully retrieved all cinema rooms", true, responses);
    }

    @Override
    public BaseResponse<List<CinemaRoomResponse>> getCinemaRoomsByCinemaId(Integer cinemaId) {
        List<CinemaRoom> cinemaRooms = cinemaRoomRepository.findByCinemaCinemaID(cinemaId);
        List<CinemaRoomResponse> responses = cinemaRooms.stream()
                .map(room -> CinemaRoomResponse.builder()
                        .cinemaRoomId(room.getCinemaRoomID())
                        .roomName(room.getRoomName())
                        .seatQuantity(room.getSeatQuantity())
                        .address(room.getCinema() != null ? room.getCinema().getAddress() : null)
                        .name(room.getCinema() != null ? room.getCinema().getName() : null)
                        .city(room.getCinema() != null && room.getCinema().getCity() != null ? room.getCinema().getCity().getName() : null)
                        .cinemaId(room.getCinema() != null ? room.getCinema().getCinemaID() : null)
                        .build())
                .collect(Collectors.toList());
        return new BaseResponse<>("Successfully retrieved cinema rooms for cinema id: " + cinemaId, true, responses);
    }
} 