package movie.swp391.serviceImp;

import lombok.RequiredArgsConstructor;
import movie.swp391.entity.*;
import movie.swp391.entity.*;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.mapper.ShowTimeV2Mapper;
import movie.swp391.repository.*;
import movie.swp391.repository.*;
import movie.swp391.request.promotion.PromotionDto;
import movie.swp391.request.TicketBookingRequest;
import movie.swp391.response.*;
import movie.swp391.response.BookingConfirmationResponse.SeatConfirmationInfo;
import movie.swp391.response.*;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.response.TicketBookingResponse;
import movie.swp391.response.promotion.AppliedPromotionDto;
import movie.swp391.service.PromotionService;
import movie.swp391.service.TicketBookingService;
import movie.swp391.service.VNpayService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import movie.swp391.request.FoodAndDrinkOrderRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketBookingServiceImpl implements TicketBookingService {

    private final TicketBookingRepository ticketBookingRepository;
    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final CustomerRepository customerRepository;
    private final ShowTimeV2Mapper showTimeV2Mapper;
    private final VNpayService vNpayService;
    private final TicketDetailRepository ticketDetailRepository;
    private final PromotionRepository promotionRepository;
    private final PromotionService promotionService;
    private final FoodAndDrinkRepository foodAndDrinkRepository;
    private final BookingFoodAndDrinkRepository bookingFoodAndDrinkRepository;


    @Override
    public BaseResponse<List<LocalDate>> getAvailableDates(Integer movieId) {
        LocalDate today = LocalDate.now();
        List<Showtime> showtimes = showtimeRepository.findByMovieMovieIDAndDateAfterOrDateEquals(movieId, today, today);

        List<LocalDate> dates = showtimes.stream()
                .map(Showtime::getDate)
                .distinct()
                .collect(Collectors.toList());

        return new BaseResponse<>("Successfully retrieved available dates", true, dates);
    }

    @Override
    public BaseResponse<List<LocalTime>> getAvailableTimes(Integer movieId, LocalDate date) {
        List<Showtime> showtimes = showtimeRepository.findByMovieMovieIDAndDate(movieId, date);

        if (showtimes.isEmpty()) {
            return new BaseResponse<>("No available showtimes found for this date", false, null);
        }

        List<LocalTime> times = showtimes.stream()
                .map(Showtime::getTime)
                .collect(Collectors.toList());

        return new BaseResponse<>("Successfully retrieved available showtimes", true, times);
    }

    @Override
    public BaseResponse<SeatSelectionResponse> getAvailableSeats(Integer movieId, LocalDate date, LocalTime time) {

        List<Showtime> showtimes = showtimeRepository.findByMovieMovieIDAndDate(movieId, date);
        Showtime showtime = showtimes.stream()
                .filter(st -> st.getTime().equals(time))
                .findFirst()
                .orElse(null);
        if (showtime == null) {
            return new BaseResponse<>("Showtime not found", false, null);
        }


        List<Seat> seats = seatRepository.findByCinemaRoom(showtime.getCinemaRoom());
        if (seats.isEmpty()) {
            return new BaseResponse<>("No seats found for this cinema room", false, null);
        }

        List<String> bookedSeatNames = ticketBookingRepository.findByShowtimeShowtimeID(showtime.getShowtimeID())
                .stream()
                .flatMap(booking -> booking.getTicketDetails().stream())
                .map(detail -> detail.getSeat().getSeatName())
                .collect(Collectors.toList());


        List<SeatSelectionResponse.SeatInfo> seatInfos = seats.stream()
                .map(seat -> SeatSelectionResponse.SeatInfo.builder()
                        .seatName(seat.getSeatName())
                        .seatType(seat.getSeatType())
                        .isAvailable(!bookedSeatNames.contains(seat.getSeatName()) && seat.getIsAvailable())
                        .price(seat.getPrice() != null ? seat.getPrice() : 0.0)
                        .row(seat.getRow())
                        .column(seat.getColumn())
                        .status((!bookedSeatNames.contains(seat.getSeatName()) && seat.getIsAvailable()) ? "Blank" : "Occupied")
                        .build())
                .collect(Collectors.toList());

        SeatSelectionResponse response = SeatSelectionResponse.builder()
                .cinemaRoom(showtime.getCinemaRoom().getRoomName())
                .seats(seatInfos)
                .build();

        return new BaseResponse<>("Successfully retrieved available seats", true, response);
    }

    @Override
    public BaseResponse<BookingConfirmationResponse> getBookingConfirmation(TicketBookingRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
        if (customer == null) {
            return new BaseResponse<>("Customer not found", false, null);
        }

        Showtime showtime = showtimeRepository.findMatchingShowtime(
                request.getMovieId(), request.getShowDate(), request.getShowTime(), request.getCinemaRoomId());
        if (showtime == null) {
            return new BaseResponse<>("Showtime not found", false, null);
        }

        List<SeatConfirmationInfo> seatInfos = new ArrayList<>();
        double totalPrice = 0.0;
        List<Integer> seatIds = request.getSeatIds();
        if (seatIds != null && !seatIds.isEmpty()) {
            for (Integer seatId : seatIds) {
                Seat seat = seatRepository.findById(seatId).orElse(null);
                if (seat == null || !seat.getCinemaRoom().getCinemaRoomID().equals(request.getCinemaRoomId())) {
                    return new BaseResponse<>("Seat không hợp lệ hoặc không thuộc phòng chiếu này", false, null);
                }
                double seatPrice = seat.getPrice() != null ? seat.getPrice() : 0.0;
                seatInfos.add(new SeatConfirmationInfo(seatId,seat.getSeatName(), seat.getSeatType(), seatPrice));
                totalPrice += seatPrice;
            }
        }

        if (seatInfos.size() != request.getSeatNames().size()) {
            return new BaseResponse<>("Mismatch in requested and found seats", false, null);
        }

        // ==== PROMOTIONS ====
        List<PromotionDto> validPromotions = promotionService.getValidPromotionsForPreview(
                customer.getCustomerID(),
                showtime.getMovie().getMovieID(),
                showtime.getCinemaRoom().getCinemaRoomID(),
                showtime.getDate(),
                showtime.getTime(),
                seatIds
        );

        List<PromotionDto> selectedPromotions = new ArrayList<>();
        if (request.getPromotionIds() != null && !request.getPromotionIds().isEmpty()) {
            selectedPromotions = validPromotions.stream()
                    .filter(p -> request.getPromotionIds().contains(p.getPromotionId()))
                    .collect(Collectors.toList());

            if (selectedPromotions.size() != request.getPromotionIds().size()) {
                return new BaseResponse<>("Một hoặc nhiều promotion không hợp lệ", false, null);
            }

            boolean hasExclusive = selectedPromotions.stream().anyMatch(PromotionDto::getIsExclusive);
            if (hasExclusive && selectedPromotions.size() > 1) {
                return new BaseResponse<>("Không thể áp dụng nhiều promotion nếu có exclusive", false, null);
            }

            if (!hasExclusive) {
                Set<String> groupCodes = selectedPromotions.stream()
                        .map(PromotionDto::getGroupCode)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());
                if (groupCodes.size() > 1) {
                    return new BaseResponse<>("Không thể áp dụng các promotion thuộc nhiều groupCode khác nhau", false, null);
                }
            }
        }

        double finalPrice = totalPrice;
        List<AppliedPromotionDto> appliedPromotions = new ArrayList<>();

        for (PromotionDto promo : selectedPromotions) {
            AppliedPromotionDto applied = applyPromotion(promo, totalPrice); // tính discount từ giá gốc
            finalPrice -= applied.getDiscountAmount();                        // trừ dần
            appliedPromotions.add(applied);
        }


        // ==== FOOD & DRINKS ====
        List<BookingConfirmationResponse.FoodAndDrinkInfo> foodAndDrinks = new ArrayList<>();
        double foodTotal = 0.0;
        if (request.getFoodAndDrinks() != null) {
            for (FoodAndDrinkOrderRequest fd : request.getFoodAndDrinks()) {
                FoodAndDrink food = foodAndDrinkRepository.findById(fd.getId())
                        .orElseThrow(() -> new RuntimeException("Food not found: " + fd.getId()));
                foodAndDrinks.add(new BookingConfirmationResponse.FoodAndDrinkInfo(
                        food.getId(), food.getName(), food.getType(), food.getPrice(),
                        food.getImage(), fd.getQuantity()));
                foodTotal += food.getPrice() * fd.getQuantity();
            }
        }

        BookingConfirmationResponse response = BookingConfirmationResponse.builder()
                .movieName(showtime.getMovie().getTitle())
                .screen(showtime.getCinemaRoom().getRoomName())
                .date(showtime.getDate())
                .time(showtime.getTime())
                .seats(seatInfos)
                .totalPrice(totalPrice)
                .priceAfterApplyPromotion(finalPrice)
                .fullName(customer.getFullName())
                .email(customer.getEmail())
                .identityCard(customer.getIdentityCard())
                .phoneNumber(customer.getPhone())
                .appliedPromotions(appliedPromotions)
                .foodAndDrinks(foodAndDrinks)
                .discountVip(0.0)
                .build();

        return new BaseResponse<>("Successfully retrieved booking confirmation", true, response);
    }

    private AppliedPromotionDto applyPromotion(PromotionDto promo, double basePrice) {
        double rawDiscount = 0.0;

        if ("PERCENTAGE".equalsIgnoreCase(promo.getPromotionType())) {
            rawDiscount = basePrice * promo.getValue() / 100.0;
        } else if ("FIXED_AMOUNT".equalsIgnoreCase(promo.getPromotionType())) {
            rawDiscount = promo.getValue();
        }

        // Giới hạn theo maxDiscountAmount nếu có
        if (promo.getMaxDiscountAmount() != null) {
            rawDiscount = Math.min(rawDiscount, promo.getMaxDiscountAmount());
        }

        // Không giảm quá giá đơn
        rawDiscount = Math.min(rawDiscount, basePrice);

        return AppliedPromotionDto.builder()
                .promotionId(promo.getPromotionId())
                .title(promo.getTitle())
                .startTime(promo.getStartTime())
                .endTime(promo.getEndTime())
                .value(promo.getValue())
                .detail(promo.getDetail())
                .image(promo.getImage())
                .isExclusive(promo.getIsExclusive())
                .groupCode(promo.getGroupCode())
                .promotionType(promo.getPromotionType())
                .condition(promo.getCondition())
                .status(promo.getStatus())
                .discountAmount(rawDiscount)
                .maxDiscountAmount(promo.getMaxDiscountAmount()) // 👈 set ở đây
                .build();
    }




    @Override
    @Transactional
    public BaseResponse<TicketBookingResponse> createBooking(TicketBookingRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
        if (customer == null) {
            return new BaseResponse<>("Customer not found", false, null);
        }

        Showtime showtime = showtimeRepository.findMatchingShowtime(
                request.getMovieId(), request.getShowDate(), request.getShowTime(), request.getCinemaRoomId());

        if (showtime == null) {
            return new BaseResponse<>("Showtime not found", false, null);
        }

        List<String> bookedSeatNames = ticketBookingRepository.findByShowtimeShowtimeID(showtime.getShowtimeID()).stream()
                .filter(booking -> !"Cancelled".equals(booking.getStatus()))
                .flatMap(booking -> booking.getTicketDetails().stream())
                .map(detail -> detail.getSeat().getSeatName())
                .collect(Collectors.toList());

        List<Seat> seats = new ArrayList<>();
        double totalPrice = 0.0;

        List<Integer> seatIds = request.getSeatIds();
        if (seatIds != null && !seatIds.isEmpty()) {
            for (Integer seatId : seatIds) {
                Seat seat = seatRepository.findById(seatId).orElse(null);
                if (seat == null || !seat.getCinemaRoom().getCinemaRoomID().equals(request.getCinemaRoomId())) {
                    return new BaseResponse<>("Seat không hợp lệ hoặc không thuộc phòng chiếu này", false, null);
                }
                boolean isBooked = ticketBookingRepository.existsByShowtimeAndSeatNameAndStatusNot(
                        showtime, seat.getSeatName(), "cancelled");
                if (isBooked) {
                    return new BaseResponse<>("Seat " + seat.getSeatName() + " is already booked", false, null);
                }
                seats.add(seat);
                totalPrice += (seat.getPrice() != null) ? seat.getPrice() : 0.0;
            }
        } else {
            for (String seatName : request.getSeatNames()) {
                Seat seat = seatRepository.findByCinemaRoomAndSeatName(showtime.getCinemaRoom(), seatName);
                if (seat == null) {
                    return new BaseResponse<>("Seat " + seatName + " is not available", false, null);
                }
                boolean isBooked = ticketBookingRepository.existsByShowtimeAndSeatNameAndStatusNot(
                        showtime, seat.getSeatName(), "cancelled");
                if (isBooked) {
                    return new BaseResponse<>("Seat " + seat.getSeatName() + " is already booked", false, null);
                }
                seats.add(seat);
                totalPrice += (seat.getPrice() != null) ? seat.getPrice() : 0.0;
            }
        }
        List<BookingFoodAndDrink> bookingFoodAndDrinks = new ArrayList<>();
        List<TicketBookingResponse.FoodAndDrinkInfo> foodAndDrinkInfoList = new ArrayList<>();
        double foodAndDrinkTotal = 0.0;
        if (request.getFoodAndDrinks() != null && !request.getFoodAndDrinks().isEmpty()) {
            for (FoodAndDrinkOrderRequest fdOrder : request.getFoodAndDrinks()) {
                FoodAndDrink foodAndDrink = foodAndDrinkRepository.findById(fdOrder.getId())
                        .orElseThrow(() -> new RuntimeException("FoodAndDrink not found: " + fdOrder.getId()));
                BookingFoodAndDrink bookingFoodAndDrink = new BookingFoodAndDrink();
                bookingFoodAndDrink.setFoodAndDrink(foodAndDrink);
                bookingFoodAndDrink.setQuantity(fdOrder.getQuantity());
                bookingFoodAndDrinks.add(bookingFoodAndDrink);
                foodAndDrinkInfoList.add(new TicketBookingResponse.FoodAndDrinkInfo(
                        foodAndDrink.getId(),
                        foodAndDrink.getName(),
                        foodAndDrink.getType(),
                        foodAndDrink.getPrice(),
                        foodAndDrink.getImage(),
                        fdOrder.getQuantity()
                ));
                foodAndDrinkTotal += foodAndDrink.getPrice() * fdOrder.getQuantity();
            }
        }

        // ÁP DỤNG PROMOTIONS
        // Lọc danh sách DTO hợp lệ
        List<PromotionDto> validPromotions = promotionService.getValidPromotionsForPreview(
                customer.getCustomerID(),
                showtime.getMovie().getMovieID(),
                showtime.getCinemaRoom().getCinemaRoomID(),
                showtime.getDate(),
                showtime.getTime(),
                seatIds
        );


        List<PromotionDto> selectedPromotionDtos = new ArrayList<>();
        if (request.getPromotionIds() != null && !request.getPromotionIds().isEmpty()) {
            selectedPromotionDtos = validPromotions.stream()
                    .filter(p -> request.getPromotionIds().contains(p.getPromotionId()))
                    .collect(Collectors.toList());

            // Kiểm tra số lượng khớp không
            if (selectedPromotionDtos.size() != request.getPromotionIds().size()) {
                return new BaseResponse<>("Một hoặc nhiều promotion không hợp lệ", false, null);
            }

            boolean hasExclusive = selectedPromotionDtos.stream().anyMatch(PromotionDto::getIsExclusive);
            if (hasExclusive && selectedPromotionDtos.size() > 1) {
                return new BaseResponse<>("Không thể áp dụng nhiều promotion nếu có exclusive", false, null);
            }

            if (!hasExclusive) {
                Set<String> actualGroupCodes = selectedPromotionDtos.stream()
                        .map(PromotionDto::getGroupCode)
                        .filter(code -> code != null && !code.trim().isEmpty())
                        .collect(Collectors.toSet());

                if (actualGroupCodes.size() > 1) {
                    return new BaseResponse<>("Không thể áp dụng các promotion thuộc nhiều groupCode khác nhau", false, null);
                }
            }


        }

// Lấy danh sách entity Promotion từ repository
        List<Promotion> selectedPromotions = promotionRepository.findAllById(
                selectedPromotionDtos.stream()
                        .map(PromotionDto::getPromotionId)
                        .toList()
        );



        // ========================== TÍNH GIÁ SAU KHUYẾN MÃI ==========================
        double finalPrice = totalPrice;
        for (Promotion promo : selectedPromotions) {
            double discount = 0.0;
            if ("PERCENTAGE".equalsIgnoreCase(promo.getPromotionType())) {
                discount = totalPrice * promo.getValue() / 100.0;
            } else if ("FIXED_AMOUNT".equalsIgnoreCase(promo.getPromotionType())) {
                discount = promo.getValue();
            }

            // Áp dụng giới hạn nếu có
            if (promo.getMaxDiscountAmount() != null) {
                discount = Math.min(discount, promo.getMaxDiscountAmount());
            }

            finalPrice -= discount;
        }
        finalPrice = Math.max(0, finalPrice);


        TicketBooking booking = new TicketBooking();
        booking.setCustomer(customer);
        booking.setShowtime(showtime);
        booking.setDateShow(showtime.getDate());
        booking.setTimeShow(showtime.getTime());
        booking.setRoomName(showtime.getCinemaRoom().getRoomName());
        booking.setBookingDate(LocalDateTime.now());
        booking.setPoster(showtime.getMovie().getPoster());
        booking.setMovieTitle(showtime.getMovie().getTitle());
        booking.setStatus("pending");
        booking.setTotalPrice(finalPrice);
        booking.setConvertedScore(0);
        booking.setCinemaName(showtime.getCinemaRoom().getCinema().getName());
        booking.setCity(showtime.getCinemaRoom().getCinema().getCity().getName());
        booking.setPromotions(selectedPromotions);
        booking.setBookingFoodAndDrinks(bookingFoodAndDrinks);

        List<TicketDetail> ticketDetails = seats.stream()
                .map(seat -> {
                    TicketDetail detail = new TicketDetail();
                    detail.setBooking(booking);
                    detail.setSeat(seat);
                    detail.setUnitPrice(seat.getPrice() != null ? seat.getPrice() : 0.0);
                    detail.setCheckSeat("Occupied");
                    return detail;
                })
                .collect(Collectors.toList());

        booking.setTicketDetails(ticketDetails);
        for (BookingFoodAndDrink bfd : bookingFoodAndDrinks) {
            bfd.setBooking(booking);
        }
        TicketBooking savedBooking = ticketBookingRepository.save(booking);

        return new BaseResponse<>("Booking created successfully", true, mapToResponse(savedBooking));
    }

    @Scheduled(fixedRate = 20000   )
    @Transactional
    public void updatePendingBookings() {
        List<TicketBooking> pendingBookings = ticketBookingRepository.findByStatus("pending");
        LocalDateTime now = LocalDateTime.now();

        for (TicketBooking booking : pendingBookings) {
            List<TicketDetail> details= booking.getTicketDetails();
            if(booking.getBookingDate().plusMinutes(5).isBefore(now)) {
                for (TicketDetail detail : details) {

                    ticketDetailRepository.updateCheckSeatToBlank(booking.getBookingID());
                }
                ticketBookingRepository.updateStatusToCancelled(booking.getBookingID());
            }

        }
    }

    @Override
    public BaseResponse<List<TicketBookingResponse>> getCustomerBookings(Integer customerId) {
        List<TicketBooking> bookings = ticketBookingRepository.findByCustomerCustomerIDOrderByBookingDateDesc(customerId);

        if (bookings.isEmpty()) {
            return new BaseResponse<>("No booked tickets found.", false, null);
        }

        List<TicketBookingResponse> responses = bookings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new BaseResponse<>("Successfully retrieved ticket bookings", true, responses);
    }

    @Override
    public BaseResponse<List<TicketBookingResponse>> getCustomerBookingsByStatus(Integer customerId, String status) {
        List<TicketBooking> bookings = ticketBookingRepository.findByCustomerCustomerIDAndStatusOrderByBookingDateDesc(customerId, status);

        if (bookings.isEmpty()) {
            return new BaseResponse<>("No " + status + " tickets found", false, null);

        }

        List<TicketBookingResponse> responses = bookings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new BaseResponse<>("Successfully retrieved " + status + " ticket bookings", true, responses);
    }

    @Override
    @Transactional
    public BaseResponse<String> cancelBooking(Integer bookingId) {
        TicketBooking booking = ticketBookingRepository.findById(bookingId)
                .orElse(null);

        if (booking == null) {
            return new BaseResponse<>("Booking not found", false, null);
        }
        if ("Cancelled".equals(booking.getStatus())) {
            return new BaseResponse<>("Booking is already cancelled", false, null);
        }

        booking.setStatus("cancelled");
        ticketBookingRepository.save(booking);

        return new BaseResponse<>("Booking cancelled successfully", true, null);
    }

    private TicketBookingResponse mapToResponse(TicketBooking booking) {
        return new TicketBookingResponse(
                booking.getBookingID(),
                booking.getMovieTitle(),
                booking.getPoster(),
                booking.getDateShow(),
                booking.getTimeShow(),
                booking.getRoomName(),
                booking.getTicketDetails().stream()
                        .map(detail -> new TicketBookingResponse.SeatInfoResponse(
                                detail.getSeat().getSeatID(),
                                detail.getSeat().getSeatName(),
                                detail.getSeat().getSeatType(),
                                detail.getSeat().getStatus(),
                                detail.getUnitPrice()
                        ))
                        .collect(Collectors.toList()),
                booking.getTotalPrice(),
                booking.getConvertedScore(),
                booking.getStatus(),
                booking.getBookingDate(),
                booking.getCustomer().getCustomerID(),
                booking.getCity(),
                booking.getCinemaName(),
                booking.getBookingFoodAndDrinks() != null ? booking.getBookingFoodAndDrinks().stream()
                        .map(fd -> new TicketBookingResponse.FoodAndDrinkInfo(
                                fd.getFoodAndDrink().getId(),
                                fd.getFoodAndDrink().getName(),
                                fd.getFoodAndDrink().getType(),
                                fd.getFoodAndDrink().getPrice(),
                                fd.getFoodAndDrink().getImage(),
                                fd.getQuantity()
                        )).collect(Collectors.toList()) : null
        );
    }

    private TicketBookingResponsePayment mapToResponsePayment(TicketBooking booking, String paymentUrl) {
        return new TicketBookingResponsePayment(
                booking.getBookingID(),
                booking.getMovieTitle(),
                booking.getPoster(),
                booking.getDateShow(),
                booking.getTimeShow(),
                booking.getRoomName(),
                booking.getTicketDetails().stream()
                        .map(detail -> new TicketBookingResponsePayment.SeatInfoResponse(
                                detail.getSeat().getSeatName(),
                                detail.getSeat().getSeatType(),
                                detail.getUnitPrice()
                        ))
                        .collect(Collectors.toList()),
                booking.getTotalPrice(),
                booking.getConvertedScore(),
                booking.getStatus(),
                booking.getBookingDate(),
                booking.getCustomer().getCustomerID(),
                booking.getCity(),
                booking.getCinemaName(),
                paymentUrl

        );
    }

    private Double calculateTotalPrice(Showtime showtime, List<Seat> seats) {
        return seats.stream()
                .mapToDouble(seat -> seat.getPrice() != null ? seat.getPrice() : 0.0)
                .sum();
    }

    private MovieSelectionResponse mapToMovieSelectionResponse(Movie movie) {
        return MovieSelectionResponse.builder()
                .movieId(movie.getMovieID())
                .title(movie.getTitle())
                .poster(movie.getPoster())
                .version(movie.getVersion())
                .build();
    }

    @Override
    public List<TicketBookingResponse> getAllBookings() {
        List<TicketBooking> booking = ticketBookingRepository.findAll();
        if (booking.isEmpty()) throw new AppException(ErrorHandler.LIST_EMPTY);
        List<TicketBookingResponse> response = booking.stream().map(this::mapToResponse).collect(Collectors.toList());
        return response;
    }


    @Override
    public ShowTimeForCustomerResponse getShowtimeForCustomer(Integer movieId) {
        List<Showtime> showtimes = showtimeRepository.findByMovie_MovieID(movieId);

        Map<LocalDate, List<Showtime>> dateGroupedShowtimes = showtimes.stream()
                .collect(Collectors.groupingBy(Showtime::getDate));

        List<ShowTimeForCustomerResponse.LocalDateGroup> dateGroups = new ArrayList<>();

        LocalDate today = LocalDate.now();
        LocalTime nowPlus15Min = LocalTime.now().plusMinutes(15);

        for (Map.Entry<LocalDate, List<Showtime>> dateEntry : dateGroupedShowtimes.entrySet()) {
            LocalDate date = dateEntry.getKey();
            List<Showtime> dailyShowtimes = dateEntry.getValue();

            boolean isToday = date.equals(today);
            boolean isFutureDate = date.isAfter(today);

            if (!isToday && !isFutureDate) continue;

            Map<Integer, ShowTimeForCustomerResponse.CityDTO> cityMap = new HashMap<>();

            for (Showtime showtime : dailyShowtimes) {
                LocalTime time = showtime.getTime();
                if (isToday && time.isBefore(nowPlus15Min)) continue;

                City city = showtime.getCinemaRoom().getCinema().getCity();
                Cinema cinema = showtime.getCinemaRoom().getCinema();
                CinemaRoom room = showtime.getCinemaRoom();

                int cityId = city.getCityID();
                int cinemaId = cinema.getCinemaID();
                int roomId = room.getCinemaRoomID();

                // Add city if not present
                if (!cityMap.containsKey(cityId)) {
                    ShowTimeForCustomerResponse.CityDTO cityDTO = new ShowTimeForCustomerResponse.CityDTO();
                    cityDTO.setCityID(cityId);
                    cityDTO.setName(city.getName());
                    cityDTO.setCinemas(new ArrayList<>());
                    cityMap.put(cityId, cityDTO);
                }

                ShowTimeForCustomerResponse.CityDTO cityDTO = cityMap.get(cityId);

                // Add cinema if not present
                ShowTimeForCustomerResponse.CinemaDTO cinemaDTO = cityDTO.getCinemas().stream()
                        .filter(c -> c.getCinemaID().equals(cinemaId))
                        .findFirst()
                        .orElseGet(() -> {
                            ShowTimeForCustomerResponse.CinemaDTO dto = new ShowTimeForCustomerResponse.CinemaDTO();
                            dto.setCinemaID(cinemaId);
                            dto.setName(cinema.getName());
                            dto.setAddress(cinema.getAddress());
                            dto.setCinemaRooms(new ArrayList<>());
                            cityDTO.getCinemas().add(dto);
                            return dto;
                        });

                // Add cinema room if not present
                ShowTimeForCustomerResponse.CinemaRoomDTO roomDTO = cinemaDTO.getCinemaRooms().stream()
                        .filter(r -> r.getCinemaRoomID().equals(roomId))
                        .findFirst()
                        .orElseGet(() -> {
                            ShowTimeForCustomerResponse.CinemaRoomDTO dto = new ShowTimeForCustomerResponse.CinemaRoomDTO();
                            dto.setCinemaRoomID(roomId);
                            dto.setRoomName(room.getRoomName());
                            dto.setSeatQuantity(room.getSeats().size());
                            dto.setTimes(new ArrayList<>());
                            cinemaDTO.getCinemaRooms().add(dto);
                            return dto;
                        });

                // Add showtime (time) to cinema room
                ShowTimeForCustomerResponse.ShowtimeDTO showtimeDTO = new ShowTimeForCustomerResponse.ShowtimeDTO();
                showtimeDTO.setTime(showtime.getTime());

                // Khởi tạo danh sách ghế cho showtimeDTO nếu chưa có
                if (showtimeDTO.getSeats() == null) {
                    showtimeDTO.setSeats(new ArrayList<>());
                }
                showtimeDTO.setActive(showtime.getActive());

                // Thêm các ghế vào showtimeDTO
                for (Seat seat : room.getSeats()) {
                    ShowTimeForCustomerResponse.SeatDTO seatDTO = new ShowTimeForCustomerResponse.SeatDTO();
                    seatDTO.setSeatID(seat.getSeatID());
                    seatDTO.setSeatName(seat.getSeatName());
                    seatDTO.setSeatType(seat.getSeatType());
                    seatDTO.setIsAvailable(seat.getIsAvailable());
                    seatDTO.setPrice(seat.getPrice());
                    showtimeDTO.getSeats().add(seatDTO);
                }

                // Cập nhật trạng thái ghế cho từng showtime
                updateSeatStatusForShowtime(showtimeDTO, showtime);

                // Thêm showtime vào room
                roomDTO.getTimes().add(showtimeDTO);
            }

            // Clean up rooms with no showtimes (but still show them if they exist)
            for (ShowTimeForCustomerResponse.CityDTO cityDTO : cityMap.values()) {
                cityDTO.getCinemas().removeIf(cinemaDTO -> {
                    List<ShowTimeForCustomerResponse.CinemaRoomDTO> validRooms = cinemaDTO.getCinemaRooms().stream()
                            .filter(r -> r.getTimes() != null && !r.getTimes().isEmpty())
                            .collect(Collectors.toList());
                    cinemaDTO.setCinemaRooms(validRooms);
                    return validRooms.isEmpty();
                });
            }

            // Remove cities with no cinemas
            List<ShowTimeForCustomerResponse.CityDTO> filteredCities = cityMap.values().stream()
                    .filter(cityDTO -> cityDTO.getCinemas() != null && !cityDTO.getCinemas().isEmpty())
                    .collect(Collectors.toList());

            if (!filteredCities.isEmpty()) {
                dateGroups.add(ShowTimeForCustomerResponse.LocalDateGroup.builder().date(date).cities(filteredCities).build());
            }
        }

        Integer showtimeId = showtimes.isEmpty() ? null : showtimes.get(0).getShowtimeID();

        return new ShowTimeForCustomerResponse(showtimeId, dateGroups);
    }
    private void updateSeatStatusForShowtime(ShowTimeForCustomerResponse.ShowtimeDTO showtimeDTO, Showtime showtime) {
        // Lấy danh sách tất cả các booking của suất chiếu
        List<TicketBooking> bookingsForShowtime = ticketBookingRepository.findByShowtime(showtime);

        if (showtimeDTO.getSeats() != null) {
            for (ShowTimeForCustomerResponse.SeatDTO seatDTO : showtimeDTO.getSeats()) {
                int seatId = seatDTO.getSeatID();

                // Tìm tất cả TicketDetail của ghế này
                List<TicketDetail> detailsForSeat = bookingsForShowtime.stream()
                        .flatMap(booking -> booking.getTicketDetails().stream())
                        .filter(detail -> detail.getSeat().getSeatID().equals(seatId))
                        .collect(Collectors.toList());

                boolean hasOccupied = detailsForSeat.stream()
                        .anyMatch(detail -> !"Blank".equalsIgnoreCase(detail.getCheckSeat()));

                if (hasOccupied) {
                    seatDTO.setStatus("Occupied");
                } else {
                    seatDTO.setStatus("Blank");
                }
            }
        }
    }
}

