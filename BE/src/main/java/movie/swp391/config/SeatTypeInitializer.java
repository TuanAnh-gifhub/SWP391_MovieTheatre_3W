package movie.swp391.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movie.swp391.entity.Seat;
import movie.swp391.entity.SeatType;
import movie.swp391.repository.SeatRepository;
import movie.swp391.repository.SeatTypeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
@Order(2)
public class SeatTypeInitializer implements CommandLineRunner {

    private final SeatTypeRepository seatTypeRepository;
    private final SeatRepository seatRepository;

    @Override
    public void run(String... args) {
        log.info("Starting seat type initialization...");

        seedSeatType("STANDARD", "Ghế thường", 50000.0, 1);
        seedSeatType("VIP", "Ghế VIP", 80000.0, 2);
        seedSeatType("DOUBLE", "Ghế đôi", 120000.0, 3);

        List<Seat> seats = seatRepository.findAll();
        boolean updated = false;
        for (Seat seat : seats) {
            if (seat.getSeatTypeRef() != null) {
                continue;
            }
            if (seat.getSeatType() == null || seat.getSeatType().isBlank()) {
                continue;
            }
            SeatType seatType = seatTypeRepository.findByCodeIgnoreCase(seat.getSeatType().trim())
                    .or(() -> seatTypeRepository.findByNameIgnoreCase(seat.getSeatType().trim()))
                    .orElse(null);
            if (seatType != null) {
                seat.setSeatTypeRef(seatType);
                if (seat.getPrice() == null) {
                    seat.setPrice(seatType.getBasePrice());
                }
                seat.setSeatType(seatType.getName());
                updated = true;
            }
        }
        if (updated) {
            seatRepository.saveAll(seats);
            log.info("Backfilled seat type relations for existing seats");
        }

        log.info("Seat type initialization completed");
    }

    private void seedSeatType(String code, String name, Double basePrice, Integer sortOrder) {
        if (seatTypeRepository.findByCodeIgnoreCase(code).isEmpty() && seatTypeRepository.findByNameIgnoreCase(name).isEmpty()) {
            SeatType seatType = SeatType.builder()
                    .code(code)
                    .name(name)
                    .basePrice(basePrice)
                    .sortOrder(sortOrder)
                    .active(true)
                    .build();
            seatTypeRepository.save(seatType);
            log.info("Created seat type: {}", code);
        } else {
            log.info("Seat type {} already exists", code);
        }
    }
}


