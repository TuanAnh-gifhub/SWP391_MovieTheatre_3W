package movie.swp391.serviceImp;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.*;
import movie.swp391.entity.*;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.repository.*;
import movie.swp391.repository.*;
import movie.swp391.request.CreateSeatRequest;
import movie.swp391.request.UpdateSeatRequest;
import movie.swp391.response.SeatFromCityresponse;
import movie.swp391.service.SeatService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class SeatServiceImpl implements SeatService {

    CinemaRepository cinemaRepository;
    CityRepository cityRepository;
    CinemaRoomRepository cinemaRoomRepository;
    SeatRepository seatRepository;
    TicketDetailRepository ticketDetailRepository;

@Override
    public List<SeatFromCityresponse> viewAllSeat() {
        List<City> cities = cityRepository.findAll();
        List<SeatFromCityresponse> response = new ArrayList<>();

        for (City city : cities) {
            List<SeatFromCityresponse.CinemaDTO> cinemaDTOs = new ArrayList<>();

            for (Cinema cinema : city.getCinemas()) {
                List<SeatFromCityresponse.CinemaRoomDTO> roomDTOs = new ArrayList<>();

                for (CinemaRoom room : cinema.getCinemaRooms()) {
                    List<SeatFromCityresponse.SeatDTO> seatDTOs = new ArrayList<>();

                    for (Seat seat : room.getSeats()) {
                        SeatFromCityresponse.SeatDTO seatDTO = SeatFromCityresponse.SeatDTO.builder()
                                .seatID(seat.getSeatID())
                                .seatName(seat.getSeatName())
                                .seatType(seat.getSeatType())
                                .price(seat.getPrice())
                                .isAvailable(seat.getIsAvailable())
                                .build();
                        seatDTOs.add(seatDTO);
                    }

                    SeatFromCityresponse.CinemaRoomDTO roomDTO = SeatFromCityresponse.CinemaRoomDTO.builder()
                            .cinemaRoomID(room.getCinemaRoomID())
                            .roomName(room.getRoomName())
                            .seatQuantity(room.getSeatQuantity())
                            .seats(seatDTOs)
                            .build();

                    roomDTOs.add(roomDTO);
                }

                SeatFromCityresponse.CinemaDTO cinemaDTO = SeatFromCityresponse.CinemaDTO.builder()
                        .cinemaID(cinema.getCinemaID())
                        .name(cinema.getName())

                        .cinemaRooms(roomDTOs)
                        .build();

                cinemaDTOs.add(cinemaDTO);
            }

            SeatFromCityresponse cityResponse = SeatFromCityresponse.builder()
                    .cityID(city.getCityID())
                    .name(city.getName())
                    .cinemas(cinemaDTOs)
                    .build();

            response.add(cityResponse);
        }
        return response;
    }


    public String createSeatsForRoom(CreateSeatRequest request) {
        CinemaRoom room = cinemaRoomRepository.findById(request.getCinemaRoomId())
                .orElseThrow(() -> new AppException(ErrorHandler.CINEMA_ROOM_NOT_FOUND));

        // 1. Kiểm tra trùng lặp trong request
        Set<String> seenSeatNames = new HashSet<>();
        for (CreateSeatRequest.SeatDTO dto : request.getSeats()) {
            if (!seenSeatNames.add(dto.getSeatName())) {
                throw new AppException(ErrorHandler.DUPLICATE_SEAT_IN_REQUEST,
                        "Ghế '" + dto.getSeatName() + "' bị trùng lặp trong danh sách yêu cầu.");
            }
        }

        // 2. Đếm số lượng ghế đã tồn tại trong phòng
        int existingSeatCount = seatRepository.countByCinemaRoom(room);
        int roomCapacity = room.getSeatQuantity(); // field quantity trong CinemaRoom

        List<Seat> createdSeats = new ArrayList<>();
        int processedCount = 0;

        for (CreateSeatRequest.SeatDTO dto : request.getSeats()) {
            if (existingSeatCount + processedCount >= roomCapacity) {
                // Vượt quá giới hạn => dừng lại và quăng lỗi
                throw new AppException(ErrorHandler.CINEMA_ROOM_FULL,
                        "Phòng chiếu đã đầy. Chỉ tạo được " + processedCount + " ghế trước khi vượt quá giới hạn " + roomCapacity + ".");
            }

            boolean exists = seatRepository.existsBySeatNameAndCinemaRoom(dto.getSeatName(), room);
            if (exists) {
                throw new AppException(ErrorHandler.SEAT_ALREADY_EXISTS,
                        "Ghế '" + dto.getSeatName() + "' đã tồn tại trong phòng chiếu này.");
            }

            Seat seat = Seat.builder()
                    .seatName(dto.getSeatName())
                    .seatType(dto.getSeatType())
                    .price(dto.getPrice())
                    .cinemaRoom(room)
                    .build();

            createdSeats.add(seat);
            processedCount++;
        }

        seatRepository.saveAll(createdSeats);
        return "Đã tạo thành công " + processedCount + " ghế.";
    }

    public String updateSeat(UpdateSeatRequest request) {
        CinemaRoom room = cinemaRoomRepository.findById(request.getCinemaRoomId())
                .orElseThrow(() -> new AppException(ErrorHandler.CINEMA_ROOM_NOT_FOUND));

        Seat seat = seatRepository.findById(request.getSeatId())
                .orElseThrow(() -> new AppException(ErrorHandler.SEAT_NOT_FOUND));

        if (!seat.getCinemaRoom().getCinemaRoomID().equals(room.getCinemaRoomID())) {
            throw new AppException(ErrorHandler.SEAT_NOT_BELONG);
        }

        seat.setSeatName(request.getSeatName());
        seat.setSeatType(request.getSeatType());
        seat.setPrice(request.getPrice());
        seatRepository.save(seat);

        return "Đã cập nhật thành công";
    }

    @Override
    public void turnOnOffSeat(List<Integer> seatId){
        List<Seat> seats = seatRepository.findAllById(seatId);

        for (Seat seat : seats) {
            if (seat.getIsAvailable()) {
                if (checkIfSeatActive(seat.getSeatID())) {
                    String mess = "Chỗ ngồi " + seat.getSeatName() + " đã có người đặt có suất chiếu ở tương lai";
                    throw new AppException(ErrorHandler.SEAT_IN_ACTIVE, mess);
                }
            }
        }
        for (Seat seat : seats) {
            seat.setIsAvailable(!seat.getIsAvailable());
        }
        seatRepository.saveAll(seats);
    }

    public boolean checkIfSeatActive(Integer seatId) {
        List<TicketDetail> details = ticketDetailRepository.findBySeat_SeatIDAndCheckSeat(seatId, "Occupied");

        LocalDate nowDate = LocalDate.now();
        LocalTime nowTime = LocalTime.now();

        for (TicketDetail td : details) {
            LocalDate showDate = td.getBooking().getShowtime().getDate();
            LocalTime showTime = td.getBooking().getShowtime().getTime();

            if (showDate.isAfter(nowDate) || (showDate.isEqual(nowDate) && showTime.isAfter(nowTime))) {
                return true;
            }
        }

        return false;
    }

} 
