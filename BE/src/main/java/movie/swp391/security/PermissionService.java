package movie.swp391.security;

import movie.swp391.entity.Account;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("permissionService")
public class PermissionService {
    public PermissionService() {
        System.out.println("DEBUG: PermissionService bean created!");
    }

    public boolean hasPermission(Authentication authentication, String permission) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        Object principal = authentication.getPrincipal();
        if (principal instanceof Account account) {
            var role = account.getRole();
            // Nếu là admin, luôn có mọi quyền
            if (role != null && "ADMIN".equalsIgnoreCase(role.getRoleName())) {
                return true;
            }
            return role != null && role.getPermissions() != null &&
                   role.getPermissions().stream().anyMatch(p -> p.getCode().equals(permission));
        }
        return false;
    }

    public boolean isSelfUpdate(Authentication authentication, Integer employeeId) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        Object principal = authentication.getPrincipal();
        if (principal instanceof Account account) {
            if (account.getEmployee() != null && account.getEmployee().getEmployeeID() != null) {
                return account.getEmployee().getEmployeeID().equals(employeeId);
            }
        }
        return false;
    }
}