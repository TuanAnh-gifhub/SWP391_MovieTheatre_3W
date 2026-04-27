package movie.swp391.serviceImp;


import lombok.RequiredArgsConstructor;
import movie.swp391.entity.Account;
import movie.swp391.entity.EmailVerificationToken;
import movie.swp391.repository.AccountRepository;
import movie.swp391.repository.EmailVerificationTokenRepository;
import movie.swp391.repository.CustomerRepository;
import movie.swp391.repository.RoleRepository;
import movie.swp391.request.auth.LoginRequest;
import movie.swp391.request.auth.RegisterRequest;
import movie.swp391.response.auth.LoginResponse;
import movie.swp391.security.JwtService;
import movie.swp391.service.AuthService;
import movie.swp391.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import movie.swp391.repository.TemporaryAccountRepository;
import movie.swp391.entity.TemporaryAccount;
import movie.swp391.service.EmailService;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final AccountService accountService;
    private final TemporaryAccountRepository temporaryAccountRepository;
    private final EmailService emailService;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;


    @Override
    public ResponseEntity<LoginResponse> login(LoginRequest request) {
        Optional<Account> optional = accountRepository.findByUsername(request.getUsername());
        if (optional.isEmpty() || !passwordEncoder.matches(request.getPassword(), optional.get().getPassword())) {


            return ResponseEntity.badRequest().body(new LoginResponse("User / password is invalid. Please try again!", null, null, null,null, null, null));
        }

        Account acc = optional.get();
        if (Boolean.FALSE.equals(acc.getActive())) {
            return ResponseEntity.badRequest().body(new LoginResponse("Account has been locked!", null, null,null,null,null, null));
        }

        String token = jwtService.generateToken(acc.getUsername(), acc.getRole().getRoleName());
        if ("CUSTOMER".equals(acc.getRole().getRoleName())) return ResponseEntity.ok(new LoginResponse("Login successful", acc.getRole().getRoleName(), token,acc.getAccountID(),acc.getCustomer().getSex(), acc.getCustomer().getFullName(), acc.getCustomer().getIsGamePlayed()));

        else if ("ADMIN".equals(acc.getRole().getRoleName())) return
                ResponseEntity.ok(new LoginResponse("Login successful", acc.getRole().getRoleName(), token,acc.getAccountID(),null, acc.getAdmin().getFullName(),null));
        return  ResponseEntity.ok(new LoginResponse("Login successful", acc.getRole().getRoleName(), token,acc.getAccountID(),null,acc.getEmployee().getFullName(),null));
    }
    @Override
    public ResponseEntity<String> register(RegisterRequest request) {
        try {
            if (accountRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body("Email already registered");
            }

            temporaryAccountRepository.findByEmail(request.getEmail())
                    .ifPresent(temporaryAccountRepository::delete);

            temporaryAccountRepository.findByUsername(request.getUsername())
                    .ifPresent(temporaryAccountRepository::delete);

            emailVerificationTokenRepository.deleteByEmail(request.getEmail());

            TemporaryAccount tempAccount = new TemporaryAccount();
            tempAccount.setUsername(request.getUsername());
            tempAccount.setPassword(passwordEncoder.encode(request.getPassword()));
            tempAccount.setEmail(request.getEmail());
            tempAccount.setFullName(request.getFullName());
            tempAccount.setPhoneNumber(request.getPhoneNumber());
            tempAccount.setDateOfBirth(request.getDateOfBirth().toString());
            tempAccount.setSex(request.getSex());
            tempAccount.setAddress(request.getAddress());
            tempAccount.setIdentityCard(request.getIdentityCard());

            tempAccount = temporaryAccountRepository.save(tempAccount);

            String otpCode = String.format("%06d", (int) (Math.random() * 1000000));

            EmailVerificationToken verificationToken = new EmailVerificationToken(otpCode, tempAccount.getEmail());
            verificationToken.setAccount(null);
            emailVerificationTokenRepository.save(verificationToken);

            emailService.sendVerificationEmail(request.getEmail(), otpCode);

            return ResponseEntity.ok("Registration successful. Please check your email to verify your account.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

}
