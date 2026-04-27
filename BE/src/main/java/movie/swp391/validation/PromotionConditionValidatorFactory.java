package movie.swp391.validation;

import movie.swp391.constant.PromotionConditionMeta;
import movie.swp391.validation.PromotionConditionValidator;
import movie.swp391.entity.Role;
import movie.swp391.repository.RoleRepository;
import movie.swp391.response.promotion.ConditionResponse;
import movie.swp391.response.promotion.Option;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class    PromotionConditionValidatorFactory {
    @Autowired
    private RoleRepository roleRepository;

    private final Map<String, PromotionConditionValidator> validatorMap = new HashMap<>();

    @Autowired
    public PromotionConditionValidatorFactory(List<PromotionConditionValidator> validators) {
        for (PromotionConditionValidator validator : validators) {
            validatorMap.put(getValidatorKey(validator), validator);
        }
    }

    private String getValidatorKey(PromotionConditionValidator validator) {
        // Ví dụ: MinOrderAmountValidator → minOrderAmount
        String className = validator.getClass().getSimpleName().replace("Validator", "");
        return className.substring(0, 1).toLowerCase() + className.substring(1);
    }

    public PromotionConditionValidator getValidator(String key) {
        return validatorMap.get(key);
    }

    public boolean containsValidator(String key) {
        return validatorMap.containsKey(key);
    }
    public List<ConditionResponse> getAvailableConditionDetails() {
        List<ConditionResponse> responses = new ArrayList<>();

        for (PromotionConditionMeta meta : PromotionConditionMeta.values()) {
            List<Option> options = null;

            if ("applicableRoles".equals(meta.getKey())) {
                options = loadApplicableRoles();
            } else if ("dayOfWeek".equals(meta.getKey())) {
                options = loadDayOfWeekOptions();
            } else if ("applicableRanks".equals(meta.getKey())) {
                options = loadApplicableRanks(); // 🟢 Thêm dòng này
            }

            responses.add(new ConditionResponse(
                    meta.getKey(),
                    meta.getDisplayName(),
                    meta.getInputType(),
                    options
            ));
        }

        return responses;
    }
    private List<Option> loadApplicableRoles() {
        List<Role> roles = roleRepository.findAll();
        List<Option> options = new ArrayList<>();
        for (Role role : roles) {
            if (role.getRoleID() != 1) { // Trừ Admin
                options.add(new Option(role.getRoleName(), role.getRoleID()));
            }
        }
        return options;
    }

    private List<Option> loadDayOfWeekOptions() {
        return List.of(
                new Option("Monday", "MON"),
                new Option("Tuesday", "TUE"),
                new Option("Wednesday", "WED"),
                new Option("Thursday", "THU"),
                new Option("Friday", "FRI"),
                new Option("Saturday", "SAT"),
                new Option("Sunday", "SUN")
        );
    }
    private List<Option> loadApplicableRanks() {
        return new ArrayList<>();
    }

}
