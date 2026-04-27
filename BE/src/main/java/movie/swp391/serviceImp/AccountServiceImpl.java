package movie.swp391.serviceImp;

import lombok.RequiredArgsConstructor;
import movie.swp391.entity.Account;
import movie.swp391.entity.EmailVerificationToken;
import movie.swp391.entity.PasswordResetToken;
import movie.swp391.entity.TemporaryAccount;
import movie.swp391.entity.Customer;
import movie.swp391.entity.Role;
import movie.swp391.repository.AccountRepository;
import movie.swp391.repository.AdminRepository;
import movie.swp391.repository.EmailVerificationTokenRepository;
import movie.swp391.repository.EmployeeRepository;
import movie.swp391.repository.PasswordResetTokenRepository;
import movie.swp391.repository.TemporaryAccountRepository;
import movie.swp391.repository.RoleRepository;
import movie.swp391.request.ForgotPasswordRequest;
import movie.swp391.request.ResetPasswordRequest;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.AccountService;
import movie.swp391.service.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;

import movie.swp391.response.AssignRoleResponse;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final AdminRepository adminRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final TemporaryAccountRepository temporaryAccountRepository;
    private final RoleRepository roleRepository;

    public BaseResponse<String> forgotPassword(ForgotPasswordRequest request) {
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (account == null) {
            return new BaseResponse<>("Email not found", false, null);
        }

        passwordResetTokenRepository.deleteByAccountId(account.getAccountID());

        String otpCode = String.format("%06d", (int) (Math.random() * 1000000));
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(otpCode);
        resetToken.setAccount(account);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        passwordResetTokenRepository.save(resetToken);

        emailService.sendVerificationEmail(account.getCustomer().getEmail(), otpCode);

        return new BaseResponse<>("Password reset OTP has been sent to your email", true, null);
    }

    @Override
    @Transactional
    public BaseResponse<String> resetPassword(ResetPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return new BaseResponse<>("Email is required", false, null);
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new BaseResponse<>("Passwords do not match", false, null);
        }

        Account account = findAccountByEmail(request.getEmail());
        if (account == null) {
            return new BaseResponse<>("Email not found", false, null);
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);

        return new BaseResponse<>("Password has been reset successfully", true, null);
    }

    private Account findAccountByEmail(String email) {
        Account customerAccount = accountRepository.findByEmail(email).orElse(null);
        if (customerAccount != null) {
            return customerAccount;
        }

        var employee = employeeRepository.findByEmail(email).orElse(null);
        if (employee != null && employee.getAccount() != null) {
            return employee.getAccount();
        }

        var admin = adminRepository.findByEmail(email).orElse(null);
        if (admin != null && admin.getAccount() != null) {
            return admin.getAccount();
        }

        return null;
    }

    @Override
    @Transactional
    public BaseResponse<String> verifyEmail(String token) {
        try {
            EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
                    .orElseThrow(() -> new RuntimeException("Invalid verification token"));

            if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                return new BaseResponse<>("Verification token has expired", false, null);
            }

            String email = verificationToken.getEmail();
            TemporaryAccount tempAccount = temporaryAccountRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Temporary account not found"));

            Account account = new Account();
            account.setUsername(tempAccount.getUsername());
            account.setPassword(tempAccount.getPassword());
            account.setActive(true);

            Role customerRole = roleRepository.findByRoleName("CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("CUSTOMER role not found"));
            account.setRole(customerRole);

            Customer customer = new Customer();
            customer.setEmail(tempAccount.getEmail());
            customer.setFullName(tempAccount.getFullName());
            customer.setDob(LocalDate.parse(tempAccount.getDateOfBirth()));
            customer.setSex(tempAccount.getSex());
            customer.setIdentityCard(tempAccount.getIdentityCard());
            customer.setPhone(tempAccount.getPhoneNumber());
            customer.setAddress(tempAccount.getAddress());
            customer.setCreatedDate(LocalDateTime.now());
            customer.setAccount(account);
            account.setCustomer(customer);

            account = accountRepository.save(account);

            verificationToken.setAccount(account);
            emailVerificationTokenRepository.save(verificationToken);

            temporaryAccountRepository.delete(tempAccount);

            return new BaseResponse<>("Email verified successfully", true, null);
        } catch (RuntimeException e) {
            return new BaseResponse<>(e.getMessage(), false, null);
        }
    }

    @Override
    @Transactional
    public void createEmailVerificationToken(Account account) {
        emailVerificationTokenRepository.deleteByAccountId(account.getAccountID());

        String otpCode = String.format("%06d", (int) (Math.random() * 1000000));
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(otpCode);
        verificationToken.setAccount(account);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        emailVerificationTokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(account.getCustomer().getEmail(), otpCode);
    }

    @Override
    public String createEmailVerificationTokenForTemporaryAccount(String email) {
        String otpCode = String.format("%06d", (int) (Math.random() * 1000000));

        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(otpCode);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));

        Account tempAccountRef = new Account();
        Customer customer = new Customer();
        customer.setEmail(email);
        tempAccountRef.setCustomer(customer);
        verificationToken.setAccount(tempAccountRef);

        emailVerificationTokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(email, otpCode);
        return otpCode;
    }

    private String generateOTP() {
        return String.format("%06d", (int) (Math.random() * 1000000));
    }

    @Override
    @Transactional
    public BaseResponse<Void> sendResetPasswordOtp(String emailOrUsername) {
        Account account = accountRepository.findByUsername(emailOrUsername).orElse(null);
        if (account == null) {
            account = accountRepository.findByEmail(emailOrUsername).orElse(null);
        }
        if (account == null) {
            return new BaseResponse<>("Account not found with given email or username", false, null);
        }
        passwordResetTokenRepository.deleteByAccountId(account.getAccountID());
        String otpCode = String.format("%06d", (int) (Math.random() * 1000000));
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(otpCode);
        resetToken.setAccount(account);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        passwordResetTokenRepository.save(resetToken);
        String email = null;
        if (account.getCustomer() != null) {
            email = account.getCustomer().getEmail();
        } else if (account.getEmployee() != null) {
            email = account.getEmployee().getEmail();
        }
        if (email == null) {
            return new BaseResponse<>("No email found for this account", false, null);
        }
        emailService.sendVerificationEmail(email, otpCode);
        return new BaseResponse<>("Password reset OTP has been sent to your email", true, null);
    }

    @Override
    public BaseResponse<String> assignRoleToAccount(Integer accountId, Integer roleId) {
        var accountOpt = accountRepository.findById(accountId);
        if (accountOpt.isEmpty()) {
            return new BaseResponse<>("user not found", false, null);
        }
        var roleOpt = roleRepository.findById(roleId);
        if (roleOpt.isEmpty()) {
            return new BaseResponse<>("role not found", false, null);
        }
        var account = accountOpt.get();
        var role = roleOpt.get();
        account.setRole(role);
        accountRepository.save(account);
        return new BaseResponse<>("Assign role success", true, null);
    }

    @Override
    @Transactional
    public BaseResponse<AssignRoleResponse> assignRoleToAccountWithDetails(Integer accountId, Integer roleId) {
        var accountOpt = accountRepository.findById(accountId);
        if (accountOpt.isEmpty()) {
            return new BaseResponse<>("User not found", false, null);
        }
        var roleOpt = roleRepository.findById(roleId);
        if (roleOpt.isEmpty()) {
            return new BaseResponse<>("Role not found", false, null);
        }
        var account = accountOpt.get();
        var role = roleOpt.get();
        if (!account.getActive()) {
            return new BaseResponse<>("Cannot assign role to inactive user", false, null);
        }
        String previousRole = account.getRole() != null ? account.getRole().getRoleName() : "None";
        account.setRole(role);
        accountRepository.save(account);
        AssignRoleResponse response = new AssignRoleResponse(
            account.getAccountID(),
            account.getUsername(),
            previousRole,
            role.getRoleName(),
            "Role assigned successfully",
            true
        );
        return new BaseResponse<>("Role assigned successfully", true, response);
    }
}