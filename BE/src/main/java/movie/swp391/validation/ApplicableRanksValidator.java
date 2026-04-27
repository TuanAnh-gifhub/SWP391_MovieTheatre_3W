package movie.swp391.validation;

import lombok.RequiredArgsConstructor;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ApplicableRanksValidator implements PromotionConditionValidator {

    @Override
    public void validate(Object value) {
        // Loyalty/rank validation removed. Only verify that value is a list if present.
        if (!(value instanceof List<?>)) {
            throw new AppException(ErrorHandler.INVALID_KEY, "applicableRanks phải là danh sách các rank (chuỗi)");
        }
        // No further validation since loyalty tiers are removed.
    }
}

