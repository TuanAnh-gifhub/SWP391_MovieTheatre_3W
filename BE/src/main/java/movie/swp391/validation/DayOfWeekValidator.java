package movie.swp391.validation;

import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DayOfWeekValidator implements PromotionConditionValidator {

    private static final List<String> VALID_DAYS = Arrays.asList(
            "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"
    );

    @Override
    public void validate(Object value) {
        if (!(value instanceof List<?> list)) {
            throw new AppException(ErrorHandler.INVALID_KEY, "DayOfWeek phải là danh sách các ngày trong tuần");
        }

        for (Object obj : list) {
            if (!(obj instanceof String day)) {
                throw new AppException(ErrorHandler.INVALID_KEY, "Giá trị ngày phải là chuỗi");
            }
            String dayUpper = day.trim().toUpperCase();
            if (!VALID_DAYS.contains(dayUpper)) {
                throw new AppException(ErrorHandler.INVALID_KEY, "Ngày không hợp lệ: " + day);
            }
        }
    }
}
