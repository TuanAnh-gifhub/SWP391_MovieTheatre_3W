package movie.swp391.config;

import lombok.extern.slf4j.Slf4j;
import movie.swp391.entity.*;
import movie.swp391.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.AbstractMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
@Order(1)
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private CinemaRepository cinemaRepository;

    @Autowired
    private CinemaRoomRepository cinemaRoomRepository;

    @Autowired
    private SeatTypeRepository seatTypeRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data initialization...");

        // Initialize roles
        initializeRoles();

        // Initialize seat types
        initializeSeatTypes();

        // Initialize cities
        initializeCities();

        // Initialize cinemas
        initializeCinemas();

        // Do not auto-seed showtimes on startup.
        // Showtime creation must happen explicitly via admin/API flows only.
        log.info("Skipping automatic showtime initialization on startup.");

        log.info("Data initialization completed!");
    }

    private void initializeRoles() {
        log.info("Starting role initialization...");
        List<String> roles = List.of("ADMIN", "EMPLOYEE", "CUSTOMER");

        for (String roleName : roles) {
            if (roleRepository.findByRoleName(roleName).isEmpty()) {
                log.info("Creating role: {}", roleName);
                Role role = new Role();
                role.setRoleName(roleName);
                roleRepository.save(role);
            } else {
                log.info("Role {} already exists", roleName);
            }
        }
        log.info("Role initialization completed");
    }

    private void initializeSeatTypes() {
        if (seatTypeRepository.count() > 0) {
            log.info("Seat types already exist. Skipping initialization.");
            return;
        }

        log.info("Initializing seat types...");

        List<SeatType> seatTypes = new ArrayList<>();

        seatTypes.add(SeatType.builder()
                .code("STANDARD")
                .name("Ghế Thường")
                .description("Ghế tiêu chuẩn")
                .basePrice(55000.0)
                .active(true)
                .sortOrder(1)
                .build());

        seatTypes.add(SeatType.builder()
                .code("VIP")
                .name("Ghế VIP")
                .description("Ghế cao cấp VIP")
                .basePrice(80000.0)
                .active(true)
                .sortOrder(2)
                .build());

        seatTypes.add(SeatType.builder()
                .code("COUPLE")
                .name("Ghế Đôi")
                .description("Ghế đôi cho công việc")
                .basePrice(120000.0)
                .active(true)
                .sortOrder(3)
                .build());

        seatTypeRepository.saveAll(seatTypes);
        log.info("Initialized {} seat types", seatTypes.size());
    }

    private void initializeCities() {
        if (cityRepository.count() > 0) {
            log.info("Cities already exist. Skipping initialization.");
            return;
        }

        log.info("Initializing cities...");

        List<City> cities = new ArrayList<>();

        cities.add(City.builder()
                .name("Hà Nội")
                .build());

        cities.add(City.builder()
                .name("TP. Hồ Chí Minh")
                .build());

        cities.add(City.builder()
                .name("Đà Nẵng")
                .build());

        cities.add(City.builder()
                .name("Hải Phòng")
                .build());

        cities.add(City.builder()
                .name("Cần Thơ")
                .build());

        cityRepository.saveAll(cities);
        log.info("Initialized {} cities", cities.size());
    }

    private void initializeCinemas() {
        if (cinemaRepository.count() > 0) {
            log.info("Cinemas already exist. Skipping initialization.");
            return;
        }

        log.info("Initializing cinemas...");

        // Get all cities
        List<City> cities = cityRepository.findAll();
        if (cities.isEmpty()) {
            log.warn("No cities found. Cannot initialize cinemas.");
            return;
        }

        List<Cinema> cinemas = new ArrayList<>();
        List<CinemaRoom> allRooms = new ArrayList<>();
        List<Seat> allSeats = new ArrayList<>();
        List<SeatType> seatTypes = seatTypeRepository.findAll();

        // Hà Nội
        Cinema cinema1 = Cinema.builder()
                .name("SIX Cinema Hà Nội - Tây Hồ")
                .address("Số 1, Phố Tây Hồ, Quận Tây Hồ, Hà Nội")
                .city(cities.get(0))
                .build();
        cinemas.add(cinema1);

        // TP. Hồ Chí Minh
        Cinema cinema2 = Cinema.builder()
                .name("SIX Cinema TP. Hồ Chí Minh - Nguyễn Huệ")
                .address("Số 2, Phố Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh")
                .city(cities.get(1))
                .build();
        cinemas.add(cinema2);

        Cinema cinema3 = Cinema.builder()
                .name("SIX Cinema TP. Hồ Chí Minh - Landmark 81")
                .address("Số 3, Bình Thạnh, TP. Hồ Chí Minh")
                .city(cities.get(1))
                .build();
        cinemas.add(cinema3);

        // Đà Nẵng
        Cinema cinema4 = Cinema.builder()
                .name("SIX Cinema Đà Nẵng - Trần Phú")
                .address("Số 4, Phố Trần Phú, Quận Hải Châu, Đà Nẵng")
                .city(cities.get(2))
                .build();
        cinemas.add(cinema4);

        cinemaRepository.saveAll(cinemas);
        log.info("Initialized {} cinemas", cinemas.size());

        // Initialize cinema rooms
        for (Cinema cinema : cinemas) {
            for (int i = 1; i <= 3; i++) {
                CinemaRoom room = CinemaRoom.builder()
                        .roomName("Phòng " + (char) (64 + i)) // Phòng A, B, C
                        .seatQuantity(48) // 6x8 = 48 seats
                        .cinema(cinema)
                        .active(true)
                        .build();
                allRooms.add(room);
            }
        }

        cinemaRoomRepository.saveAll(allRooms);
        log.info("Initialized {} cinema rooms", allRooms.size());

        // Initialize seats for each room
        for (CinemaRoom room : allRooms) {
            for (int row = 0; row < 6; row++) {
                for (int col = 1; col <= 8; col++) {
                    String seatName = (char) (65 + row) + String.format("%02d", col);
                    SeatType seatType = seatTypes.get((row * 8 + col - 1) % seatTypes.size());

                    Seat seat = Seat.builder()
                            .seatName(seatName)
                            .cinemaRoom(room)
                            .seatType(seatType.getName())
                            .seatTypeRef(seatType)
                            .status("available")
                            .row(String.valueOf((char) (65 + row)))
                            .column(col)
                            .isAvailable(true)
                            .build();
                    allSeats.add(seat);
                }
            }
        }

        seatRepository.saveAll(allSeats);
        log.info("Initialized {} seats", allSeats.size());
    }

    private void initializeShowtimes() {
        log.info("Initializing showtimes...");

        // Get available data
        List<CinemaRoom> rooms = cinemaRoomRepository.findAll();
        List<Movie> movies = movieRepository.findAll();

        if (rooms.isEmpty() || movies.isEmpty()) {
            log.warn("No cinema rooms or movies found. Skipping showtime initialization.");
            return;
        }

        List<Showtime> showtimes = new ArrayList<>();

        LocalDate startDate = LocalDate.of(2026, 5, 4);
        LocalDate endDate = LocalDate.of(2026, 5, 6);

        List<CinemaRoom> sortedRooms = rooms.stream()
                .sorted((a, b) -> Integer.compare(a.getCinemaRoomID(), b.getCinemaRoomID()))
                .toList();

        List<AbstractMap.SimpleEntry<CinemaRoom, LocalTime>> slots = new ArrayList<>();
        LocalTime[] times = {
                LocalTime.of(10, 0),
                LocalTime.of(14, 0),
                LocalTime.of(19, 30)
        };
        for (CinemaRoom room : rooms) {
            for (LocalTime time : times) {
                slots.add(new AbstractMap.SimpleEntry<>(room, time));
            }
        }

        // Create showtimes for 4-6 May 2026 inclusive
        for (LocalDate showDate = startDate; !showDate.isAfter(endDate); showDate = showDate.plusDays(1)) {
            Set<String> usedSlots = new HashSet<>();
            Set<Integer> scheduledMovieIds = new HashSet<>();
            int createdForDate = 0;

            for (Movie movie : movies) {
                if (scheduledMovieIds.contains(movie.getMovieID())) {
                    continue;
                }

                if (!showtimeRepository.findByMovieMovieIDAndDate(movie.getMovieID(), showDate).isEmpty()) {
                    scheduledMovieIds.add(movie.getMovieID());
                    continue;
                }

                AbstractMap.SimpleEntry<CinemaRoom, LocalTime> chosenSlot = null;
                for (AbstractMap.SimpleEntry<CinemaRoom, LocalTime> candidate : slots) {
                    CinemaRoom room = candidate.getKey();
                    LocalTime time = candidate.getValue();
                    String slotKey = room.getCinemaRoomID() + "_" + time;

                    if (usedSlots.contains(slotKey)) {
                        continue;
                    }
                    if (showtimeRepository.existsByDateAndCinemaRoom_CinemaRoomIDAndTime(showDate, room.getCinemaRoomID(), time)) {
                        continue;
                    }

                    chosenSlot = candidate;
                    usedSlots.add(slotKey);
                    break;
                }

                if (chosenSlot == null) {
                    log.warn("No available slot found for movie '{}' on {}. Some movies may not receive a showtime for this date.", movie.getTitle(), showDate);
                    break;
                }

                Showtime showtime = Showtime.builder()
                        .movie(movie)
                        .cinemaRoom(chosenSlot.getKey())
                        .date(showDate)
                        .time(chosenSlot.getValue())
                        .active(true)
                        .version("2D")
                        .build();

                showtimes.add(showtime);
                scheduledMovieIds.add(movie.getMovieID());
                createdForDate++;
            }

            log.info("Prepared {} new showtimes for {}", createdForDate, showDate);
        }

        // Skip expanded showtimes seeding to keep initialization fast
        // This was causing infinite loop issues during startup
        log.info("Skipping expanded showtime seeding to optimize startup time");

        if (showtimes.isEmpty()) {
            log.info("No new showtimes were needed for {} to {}", startDate, endDate);
            return;
        }

        showtimeRepository.saveAll(showtimes);
        log.info("Initialized {} showtimes for {} to {}", showtimes.size(), startDate, endDate);
    }

    private void seedExpandedShowtimes(Movie movie,
                                       LocalDate date,
                                       List<CinemaRoom> rooms,
                                       List<Showtime> target) {
        int bufferMinutes = 30;
        int minGapMinutes = movie.getRunningTime() + bufferMinutes;

        List<LocalTime> scheduledTimes = new ArrayList<>(showtimeRepository.findByMovieMovieIDAndDate(movie.getMovieID(), date).stream()
                .map(Showtime::getTime)
                .collect(Collectors.toList()));

        LocalTime earliest = date.isEqual(LocalDate.now())
                ? roundUpToMinute(LocalTime.now().plusMinutes(15))
                : LocalTime.of(7, 0);
        LocalTime latest = LocalTime.of(23, 59);

        for (LocalTime candidateTime = earliest; !candidateTime.isAfter(latest); candidateTime = candidateTime.plusMinutes(1)) {
            if (!isFarEnoughFromExisting(candidateTime, scheduledTimes, minGapMinutes)) {
                continue;
            }

            CinemaRoom availableRoom = findAvailableRoom(rooms, target, date, candidateTime, minGapMinutes);
            if (availableRoom == null) {
                continue;
            }

            target.add(Showtime.builder()
                    .movie(movie)
                    .cinemaRoom(availableRoom)
                    .date(date)
                    .time(candidateTime)
                    .active(true)
                    .version("2D")
                    .build());

            scheduledTimes.add(candidateTime);
            log.info("Seeded showtime for '{}' on {} at {} in room {}", movie.getTitle(), date, candidateTime, availableRoom.getRoomName());
        }
    }

    private CinemaRoom findAvailableRoom(List<CinemaRoom> rooms,
                                         List<Showtime> target,
                                         LocalDate date,
                                         LocalTime candidateTime,
                                         int minGapMinutes) {
        LocalTime candidateEnd = candidateTime.plusMinutes(minGapMinutes);
        LocalTime normalizedCandidateEnd = candidateEnd.isBefore(candidateTime)
                ? LocalTime.of(23, 59)
                : candidateEnd;

        for (CinemaRoom room : rooms) {
            boolean occupied = false;

            List<Showtime> existingSameRoom = new ArrayList<>(showtimeRepository.findByDateAndCinemaRoom_CinemaRoomID(date, room.getCinemaRoomID()));
            for (Showtime pending : target) {
                if (pending.getCinemaRoom() != null
                        && pending.getCinemaRoom().getCinemaRoomID().equals(room.getCinemaRoomID())
                        && pending.getDate().equals(date)) {
                    existingSameRoom.add(pending);
                }
            }

            for (Showtime existing : existingSameRoom) {
                LocalTime existingStart = existing.getTime();
                LocalTime existingEnd = existing.getTime().plusMinutes(existing.getMovie().getRunningTime() + 30);
                LocalTime normalizedExistingEnd = existingEnd.isBefore(existingStart)
                        ? LocalTime.of(23, 59)
                        : existingEnd;

                boolean overlaps = candidateTime.isBefore(normalizedExistingEnd) && existingStart.isBefore(normalizedCandidateEnd);
                if (overlaps) {
                    occupied = true;
                    break;
                }
            }

            if (!occupied && !showtimeRepository.existsByDateAndCinemaRoom_CinemaRoomIDAndTime(date, room.getCinemaRoomID(), candidateTime)) {
                return room;
            }
        }

        return null;
    }

    private boolean isFarEnoughFromExisting(LocalTime candidateTime, List<LocalTime> existingTimes, int minGapMinutes) {
        for (LocalTime existingTime : existingTimes) {
            long diff = Math.abs(Duration.between(existingTime, candidateTime).toMinutes());
            if (diff < minGapMinutes) {
                return false;
            }
        }
        return true;
    }

    private LocalTime roundUpToMinute(LocalTime time) {
        return time.withSecond(0).withNano(0);
    }
}
