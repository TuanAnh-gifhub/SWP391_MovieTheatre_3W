package movie.swp391.controller;

import lombok.RequiredArgsConstructor;
import movie.swp391.request.ResetPasswordRequest;
import movie.swp391.request.employee.EmployeeRequest;
import movie.swp391.response.EmployeeResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.EmployeeService;
import movie.swp391.repository.AccountRepository;
import movie.swp391.entity.Account;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;


import java.util.List;

@RestController
@RequestMapping("/api/admin/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final AccountRepository accountRepository;

    @PreAuthorize("@permissionService.hasPermission(authentication, 'VIEW_EMPLOYEE')")
    @GetMapping("/get-all-employee")
    public ResponseEntity<BaseResponse<List<EmployeeResponse>>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @PreAuthorize("@permissionService.hasPermission(authentication, 'ADD_EMPLOYEE')")
    @PostMapping("/add-employee")
    public ResponseEntity<BaseResponse<EmployeeResponse>> addEmployee(@RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(employeeService.addEmployee(request));
    }

    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_EMPLOYEE') or @permissionService.isSelfUpdate(authentication, #employeeId)")
    @PutMapping("/update-employee-by-id/{employeeId}")
    public ResponseEntity<BaseResponse<EmployeeResponse>> updateEmployee(@PathVariable Integer employeeId, @RequestBody EmployeeRequest request, Authentication authentication) {
        String username = authentication.getName();
        Account account = accountRepository.findByUsername(username).orElse(null);
        if (account == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new BaseResponse<>("Không xác thực được tài khoản", false, null));
        }
        String role = account.getRole().getRoleName();
        if ("EMPLOYEE".equals(role)) {
            if (account.getEmployee() == null || !account.getEmployee().getEmployeeID().equals(employeeId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new BaseResponse<>("Bạn không có quyền sửa thông tin người khác", false, null));
            }
        }
        return ResponseEntity.ok(employeeService.updateEmployee(employeeId, request));
    }
    @PreAuthorize("@permissionService.hasPermission(authentication, 'EDIT_STATUS_EMPLOYEE')")
    @PutMapping("/{id}/set-active")
    public ResponseEntity<BaseResponse<EmployeeResponse>> setActiveStatus(
            @PathVariable Integer id,
            @RequestParam boolean active) {

        return ResponseEntity.ok(employeeService.setActiveStatus(id, active));
    }

    @PreAuthorize("@permissionService.hasPermission(authentication, 'RESET_EMPLOYEE_PASSWORD') or hasRole('EMPLOYEE')")
    @PostMapping("/send-otp-reset-password")
    public ResponseEntity<BaseResponse<Void>> sendEmployeeResetPasswordOtp(@RequestParam String email) {
        return ResponseEntity.ok(employeeService.forgotEmployeePassword(email));
    }

    @PostMapping("/reset-password-with-otp")
    public ResponseEntity<BaseResponse<Void>> resetEmployeePasswordWithOtp(@RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(employeeService.resetEmployeePasswordWithOtp(request));
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<BaseResponse<Void>> forgotEmployeePassword(@RequestParam String email) {
        return ResponseEntity.ok(employeeService.forgotEmployeePassword(email));
    }
} 