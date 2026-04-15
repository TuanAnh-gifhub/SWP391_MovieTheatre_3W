package movie.swp391.validation;

import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import org.springframework.stereotype.Component;

@Component
public class MinOrderAmountValidator implements PromotionConditionValidator {

    @Override
    public void validate(Object value) {
        if (!(value instanceof Number)) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Số tiền của order phải là một con số");
        }
        double minOrderAmount = ((Number) value).doubleValue();
        if (minOrderAmount <= 0) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Số tiền của order phải lớn hơn 0");
        }
    }
}
