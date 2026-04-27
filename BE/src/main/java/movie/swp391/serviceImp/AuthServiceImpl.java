package movie.swp391.serviceImp;


import lombok.RequiredArgsConstructor;
import movie.swp391.entity.Account;
import movie.swp391.repository.AccountRepository;
import movie.swp391.repository.RoleRepository;
import movie.swp391.request.auth.LoginRequest;
import movie.swp391.request.auth.RegisterRequest;
import movie.swp391.response.auth.LoginResponse;
import movie.swp391.security.JwtService;
import movie.swp391.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;


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
            if (accountRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest().body("Username already registered");
            }
            if (accountRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body("Email already registered");
            }

            // Get CUSTOMER role
            var roleOpt = roleRepository.findByRoleName("CUSTOMER");
            if (roleOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("CUSTOMER role not found");
            }

            // Create Account
            Account account = new Account();
            account.setUsername(request.getUsername());
            account.setPassword(passwordEncoder.encode(request.getPassword()));
            account.setActive(true);
            account.setRole(roleOpt.get());

            // Create Customer
            movie.swp391.entity.Customer customer = new movie.swp391.entity.Customer();
            customer.setAccount(account);
            customer.setFullName(request.getFullName());
            customer.setDob(request.getDateOfBirth());
            customer.setSex(request.getSex());
            customer.setEmail(request.getEmail());
            customer.setIdentityCard(request.getIdentityCard());
            customer.setPhone(request.getPhoneNumber());
            customer.setAddress(request.getAddress());
            customer.setScore(0);
            customer.setFinalScore(0);
            customer.setIsGamePlayed(false);

            account.setCustomer(customer);

            accountRepository.save(account); // Cascade saves customer

            return ResponseEntity.ok("Registration successful");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

}
