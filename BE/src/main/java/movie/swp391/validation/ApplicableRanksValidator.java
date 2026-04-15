package movie.swp391.validation;

import lombok.RequiredArgsConstructor;
import movie.swp391.entity.LoyaltyTier;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.repository.LoyaltyTierRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ApplicableRanksValidator implements PromotionConditionValidator {

    private final LoyaltyTierRepository loyaltyTierRepository;

    @Override
    public void validate(Object value) {
        if (!(value instanceof List<?> list)) {
            throw new AppException(ErrorHandler.INVALID_KEY, "applicableRanks phải là danh sách các rank (chuỗi)");
        }

        List<String> validRanks = loyaltyTierRepository.findAll()
                .stream()
                .map(LoyaltyTier::getName)
                .map(String::toLowerCase)
                .toList();

        for (Object obj : list) {
            if (!(obj instanceof String rank)) {
                throw new AppException(ErrorHandler.INVALID_KEY, "Rank phải là chuỗi");
            }

            String trimmed = rank.trim().toLowerCase();
            if (trimmed.isEmpty()) {
                throw new AppException(ErrorHandler.INVALID_KEY, "Rank không được rỗng");
            }

            if (!validRanks.contains(trimmed)) {
                throw new AppException(ErrorHandler.INVALID_KEY, "Rank không tồn tại: " + rank);
            }
        }
    }
}

