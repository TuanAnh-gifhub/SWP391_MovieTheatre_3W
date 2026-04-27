package movie.swp391.serviceImp;

import lombok.RequiredArgsConstructor;
import movie.swp391.entity.*;
import movie.swp391.entity.Account;
import movie.swp391.entity.Employee;
import movie.swp391.entity.PasswordResetToken;
import movie.swp391.entity.Role;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.mapper.EmployeeMapper;
import movie.swp391.repository.AccountRepository;
import movie.swp391.repository.EmployeeRepository;
import movie.swp391.repository.RoleRepository;
import movie.swp391.request.employee.EmployeeRequest;
import movie.swp391.response.EmployeeResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.EmployeeService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import movie.swp391.request.ResetPasswordRequest;
import movie.swp391.repository.PasswordResetTokenRepository;
import movie.swp391.service.EmailService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Override
    public BaseResponse<List<EmployeeResponse>> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAllEmployeesOnly();
        List<EmployeeResponse> responses = employees.stream()
                .map(employeeMapper::toEmployeeResponse)
                .collect(Collectors.toList());

        return new BaseResponse<>("Successfully retrieved all employees", true, responses);
    }
    @Override
    @Transactional
    public BaseResponse<Void> sendEmployeeResetPasswordOtp(Integer employeeId) {
        Optional<Employee> employeeOptional = employeeRepository.findById(employeeId);
        if (employeeOptional.isEmpty()) {
            return new BaseResponse<>("Employee not found", false, null);
        }
        Employee employee = employeeOptional.get();
        Account account = employee.getAccount();
        if (account == null) {
            return new BaseResponse<>("Employee does not have an account", false, null);
        }
        passwordResetTokenRepository.deleteByAccountId(account.getAccountID());
        String otpCode = String.format("%06d", (int) (Math.random() * 1000000));
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(otpCode);
        resetToken.setAccount(account);
        resetToken.setExpiryDate(java.time.LocalDateTime.now().plusHours(24));
        passwordResetTokenRepository.save(resetToken);
        emailService.sendVerificationEmail(employee.getEmail(), otpCode);
        return new BaseResponse<>("Password reset OTP has been sent to employee's email", true, null);
    }

    @Override
    @Transactional
    public BaseResponse<Void> resetEmployeePasswordWithOtp(ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isEmpty()) {
            return new BaseResponse<>("OTP is required", false, null);
        }
        if (request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
            return new BaseResponse<>("New password is required", false, null);
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new BaseResponse<>("Password and Confirm Password do not match", false, null);
        }
        PasswordResetToken token = passwordResetTokenRepository.findByToken(request.getToken()).orElse(null);
        if (token == null) {
            return new BaseResponse<>("Invalid OTP", false, null);
        }
        if (token.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            return new BaseResponse<>("OTP has expired", false, null);
        }
        Account account = token.getAccount();
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
        passwordResetTokenRepository.delete(token);
        return new BaseResponse<>("Password has been reset successfully", true, null);
    }
    @Override
    @Transactional
    public BaseResponse<Void> forgotEmployeePassword(String email) {
        Employee employee = employeeRepository.findAll().stream()
                .filter(e -> email.equalsIgnoreCase(e.getEmail()))
                .findFirst().orElse(null);
        if (employee == null) {
            return new BaseResponse<>("Employee with this email not found", false, null);
        }
        Account account = employee.getAccount();
        if (account == null) {
            return new BaseResponse<>("Employee does not have an account", false, null);
        }
        passwordResetTokenRepository.deleteByAccountId(account.getAccountID());
        String otpCode = String.format("%06d", (int) (Math.random() * 1000000));
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(otpCode);
        resetToken.setAccount(account);
        resetToken.setExpiryDate(java.time.LocalDateTime.now().plusHours(24));
        passwordResetTokenRepository.save(resetToken);
        emailService.sendVerificationEmail(employee.getEmail(), otpCode);
        return new BaseResponse<>("Password reset OTP has been sent to your email", true, null);
    }


    @Override
    public BaseResponse<EmployeeResponse> getEmployeeById(Integer employeeId) {
        Optional<Employee> employeeOptional = employeeRepository.findEmployeeOnlyById(employeeId);

        if (employeeOptional.isEmpty()) {
            return new BaseResponse<>("Employee not found", false, null);
        }

        Employee employee = employeeOptional.get();
        EmployeeResponse response = employeeMapper.toEmployeeResponse(employee);

        return new BaseResponse<>("Successfully retrieved employee", true, response);
    }

    @Override
    public BaseResponse<List<EmployeeResponse>> searchEmployees(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllEmployees();
        }
        List<Employee> employees = employeeRepository.findEmployeesOnlyByKeyword(keyword);
        List<EmployeeResponse> responses = employees.stream()
                .map(employeeMapper::toEmployeeResponse)
                .collect(Collectors.toList());

        if (responses.isEmpty()) {
            return new BaseResponse<>("No employees found matching the keyword", false, null);
        }

        return new BaseResponse<>("Successfully retrieved employees matching keyword", true, responses);
    }

    @Override
    @Transactional
    public BaseResponse<EmployeeResponse> addEmployee(EmployeeRequest request) {

        if (accountRepository.existsByUsername(request.getUsername())) {
            return new BaseResponse<>("Username already exists", false, null);
        }

        if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
            return new BaseResponse<>("Email already exists", false, null);
        }

        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setActive(true);
        Role employeeRole = roleRepository.findByRoleName("EMPLOYEE")
                .orElseThrow(() -> new AppException(ErrorHandler.ROLE_NOT_FOUND)); // Assuming ErrorHandler and ROLE_NOT_FOUND exist
        account.setRole(employeeRole);
        Account savedAccount = accountRepository.save(account);

        Employee employee = employeeMapper.toEmployee(request);
        employee.setAccount(savedAccount);
        Employee savedEmployee = employeeRepository.save(employee);


        emailService.sendEmployeeAccountInfoEmail(employee.getEmail(), request.getUsername(), request.getPassword());

        // Fetch the saved employee with account and role information
        Optional<Employee> savedEmployeeWithDetails = employeeRepository.findByIdWithAccountAndRole(savedEmployee.getEmployeeID());
        EmployeeResponse response = employeeMapper.toEmployeeResponse(savedEmployeeWithDetails.get());

        return new BaseResponse<>("Employee added successfully", true, response);
    }

    @Override
    @Transactional
    public BaseResponse<EmployeeResponse> updateEmployee(Integer employeeId, EmployeeRequest request) {
        Optional<Employee> employeeOptional = employeeRepository.findByIdWithAccountAndRole(employeeId);
        if (employeeOptional.isEmpty()) {
            return new BaseResponse<>("Employee not found", false, null);
        }

        Employee existingEmployee = employeeOptional.get();

        Optional<Employee> employeeWithEmail = employeeRepository.findByEmail(request.getEmail());
        if (employeeWithEmail.isPresent() && !employeeWithEmail.get().getEmployeeID().equals(employeeId)) {
            return new BaseResponse<>("Email already exists", false, null);
        }

        employeeMapper.updateEmployeeFromRequest(request, existingEmployee);

        Account account = existingEmployee.getAccount();
        if (account != null) {
            if (request.getActive() != null) {
                account.setActive(request.getActive());
            }
            accountRepository.save(account);
        }

        Employee updatedEmployee = employeeRepository.save(existingEmployee);

        // Fetch the updated employee with account and role information
        Optional<Employee> updatedEmployeeWithDetails = employeeRepository.findByIdWithAccountAndRole(employeeId);
        EmployeeResponse response = employeeMapper.toEmployeeResponse(updatedEmployeeWithDetails.get());

        return new BaseResponse<>("Employee updated successfully", true, response);
    }

    @Override
    public BaseResponse<Void> turnOnOffEmployee(List<Integer> employeeIds){
        List<Employee> employees = employeeRepository.findAllById(employeeIds);

        for (Employee employee : employees) {
            employee.setActive(!employee.getActive());
        }
        employeeRepository.saveAll(employees);
        return new BaseResponse<>("Turn success",true,null);
    }
    @Override
    @Transactional
    public BaseResponse<EmployeeResponse> setActiveStatus(Integer id, boolean active) {
        Employee employee = employeeRepository.findByIdWithAccountAndRole(id)
                .orElseThrow(() -> new AppException(ErrorHandler.USER_NOT_EXISTED));
        employee.setActive(active);
        employeeRepository.save(employee);

        // Fetch the updated employee with account and role information
        Optional<Employee> updatedEmployeeWithDetails = employeeRepository.findByIdWithAccountAndRole(id);
        EmployeeResponse response = employeeMapper.toEmployeeResponse(updatedEmployeeWithDetails.get());

        return new BaseResponse<>("Cập nhật trạng thái nhân viên thành công", true, response);
    }

    @Override
    @Transactional
    public void deleteEmployeeByIds(List<Integer> employeeIds) {
        for (Integer id : employeeIds) {
            Optional<Employee> employeeOpt = employeeRepository.findById(id);
            if (employeeOpt.isPresent()) {
                Employee employee = employeeOpt.get();
                Account account = employee.getAccount();
                employeeRepository.delete(employee);
                if (account != null) {
                    accountRepository.delete(account);
                }
            }
        }
    }
    @Override
    @Transactional
    public BaseResponse<Void> resetEmployeePassword(ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isEmpty()) {
            return new BaseResponse<>("OTP is required", false, null);
        }
        if (request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
            return new BaseResponse<>("New password is required", false, null);
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new BaseResponse<>("Password and Confirm Password do not match", false, null);
        }
        PasswordResetToken token = passwordResetTokenRepository.findByToken(request.getToken()).orElse(null);
        if (token == null) {
            return new BaseResponse<>("Invalid OTP", false, null);
        }
        if (token.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            return new BaseResponse<>("OTP has expired", false, null);
        }
        Account account = token.getAccount();
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
        passwordResetTokenRepository.delete(token);
        return new BaseResponse<>("Password has been reset successfully", true, null);
    }

} 
