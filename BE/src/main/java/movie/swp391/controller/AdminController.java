package movie.swp391.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.response.*;
import movie.swp391.response.*;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.EmployeeService;
import movie.swp391.service.MemberService;
import movie.swp391.service.TicketBookingService;
import movie.swp391.service.AccountService;
import movie.swp391.repository.RoleRepository;
import movie.swp391.response.RoleResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import movie.swp391.request.AssignRoleRequest;
import jakarta.validation.Valid;
import movie.swp391.service.RoleService;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class AdminController {
    private final TicketBookingService ticketBookingService;
    private final MemberService memberService;
    private final EmployeeService employeeService;
    private final RoleRepository roleRepository;
    private final AccountService accountService;
    private final RoleService roleService;


    @GetMapping("/get-all-booking")
    public ApiResponse<List<TicketBookingResponse>> getAllBooking() {
        return ApiResponse.<List<TicketBookingResponse>>builder()
                .result(ticketBookingService.getAllBookings())
                .message("Success")
                .status(200)
                .build();
    }


    @GetMapping("/get-accounts")
    public ApiResponse<List<AccountResponse>> getAllAccount() {
        return ApiResponse.<List<AccountResponse>>builder()
                .result(memberService.getAllAccounts())
                .message("Success")
                .status(200)
                .build();
    }

    @DeleteMapping("/employees/delete-employee-by-id/{employeeId}")
    public ResponseEntity<BaseResponse<Void>> deleteEmployee(@PathVariable List<Integer> employeeId) {
        employeeService.deleteEmployeeByIds(employeeId);
        return ResponseEntity.ok(new BaseResponse<>("Employee(s) deleted successfully", true, null));
    }

    @PutMapping("/accounts/{accountId}/set-active")
    public ResponseEntity<BaseResponse<String>> setAccountActiveStatus(
            @PathVariable Integer accountId,
            @RequestParam Boolean active) {
        BaseResponse<String> response = memberService.setAccountActiveStatus(accountId, active);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/roles")
    public ResponseEntity<BaseResponse<List<RoleResponse>>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRolesFull());
    }

    @PutMapping("/accounts/assign-role-with-details")
    public ResponseEntity<BaseResponse<AssignRoleResponse>> assignRoleToAccountWithDetails(
            @RequestBody @Valid AssignRoleRequest request) {
        BaseResponse<AssignRoleResponse> response = accountService.assignRoleToAccountWithDetails(request.getAccountId(), request.getRoleId());
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(404).body(response);
        }
    }

}

