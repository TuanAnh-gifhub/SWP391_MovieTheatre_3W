package movie.swp391.validation;

import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class ApplicableRolesValidator implements PromotionConditionValidator {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void validate(Object value) {
        if (!(value instanceof List<?>)) {
            throw new AppException(ErrorHandler.INVALID_KEY, "Applicable roles phải là 1 mảng");
        }

        List<?> roles = (List<?>) value;

        for (Object roleObj : roles) {
            String roleStr = null;

            if (roleObj instanceof String str) {
                roleStr = str.trim();
            } else if (roleObj instanceof Map<?, ?> map) {
                // Nếu được gửi dưới dạng object có key "label"
                Object label = map.get("label");
                if (label instanceof String) {
                    roleStr = ((String) label).trim();
                }
            }

            if (roleStr == null || roleStr.isEmpty()) {
                throw new AppException(ErrorHandler.INVALID_KEY, "Role không được bỏ trống hoặc không hợp lệ");
            }

            if (roleRepository.findByRoleName(roleStr.toUpperCase()).isEmpty()) {
                throw new AppException(ErrorHandler.INVALID_KEY, "Không tồn tại role: " + roleStr);
            }
        }
    }
}
