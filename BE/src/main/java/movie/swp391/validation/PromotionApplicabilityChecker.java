package movie.swp391.validation;

import movie.swp391.entity.Customer;
import movie.swp391.entity.Promotion;
import movie.swp391.entity.Showtime;

public interface PromotionApplicabilityChecker {
    boolean isApplicable(Promotion promotion, Customer customer, Showtime showtime, double totalPrice);
}
