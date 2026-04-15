package movie.swp391.validation;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import movie.swp391.entity.*;
import movie.swp391.entity.Customer;
import movie.swp391.entity.Promotion;
import movie.swp391.entity.Showtime;
import movie.swp391.repository.TicketBookingRepository;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class PromotionApplicabilityCheckerImpl implements PromotionApplicabilityChecker {
    private final TicketBookingRepository bookingRepository;

    private final ObjectMapper objectMapper;

    @Override
    public boolean isApplicable(Promotion promotion, Customer customer, Showtime showtime, double totalPrice) {
        try {
            Map<String, Object> condition = objectMapper.readValue(promotion.getCondition(), new TypeReference<>() {});

            for (Map.Entry<String, Object> entry : condition.entrySet()) {
                switch (entry.getKey()) {
                    case "minOrderAmount" -> {
                        double minAmount = ((Number) entry.getValue()).doubleValue();
                        if (totalPrice < minAmount) return false;
                    }
                    case "applicableRoles" -> {
                        List<String> roles = (List<String>) entry.getValue();
                        String roleId = String.valueOf(customer.getAccount().getRole().getRoleName());
                        if (!roles.contains(roleId)) return false;
                    }
                    case "dayOfWeek" -> {
                        DayOfWeek day = showtime.getDate().getDayOfWeek();
                        List<String> days = (List<String>) entry.getValue();
                        if (!days.contains(day.name().substring(0, 3))) return false;
                    }
                    case "applicableRanks" -> {
                        List<String> validRanks = (List<String>) entry.getValue();
                        String customerRank = customer.getLoyaltyTier() != null
                                ? customer.getLoyaltyTier().getName()
                                : null;

                        if (customerRank == null || !validRanks.contains(customerRank)) return false;
                    }
                    case "firstBooking" -> {
                        boolean requireFirstBooking = Boolean.parseBoolean(entry.getValue().toString());

                        if (requireFirstBooking) {
                            boolean hasBooking = bookingRepository.existsByCustomerCustomerIDAndStatus(customer.getCustomerID(), "Success");

                            if (hasBooking) return false;
                        }
                    }
                default -> {
                        return false; // unsupported condition
                    }
                }
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}

