package movie.swp391.validation;

import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import org.springframework.stereotype.Component;

@Component
public class FirstBookingValidator implements PromotionConditionValidator {
    @Override
    public void validate(Object value) {
        if (!(value instanceof Boolean) || !(Boolean) value) {
            throw new AppException(ErrorHandler.INVALID_KEY, "firstBooking phải là true");
        }
    }
}


