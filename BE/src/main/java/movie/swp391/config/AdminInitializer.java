package movie.swp391.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movie.swp391.entity.Account;
import movie.swp391.entity.Admin;
import movie.swp391.entity.Role;
import movie.swp391.repository.AccountRepository;
import movie.swp391.repository.AdminRepository;
import movie.swp391.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2) // Run after DataInitializer which has default order
public class AdminInitializer implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (accountRepository.findByUsername("admin").isEmpty()) {
            log.info("Creating admin account...");
            createAdminAccount();
        } else {
            log.info("Admin account already exists, skipping creation.");
        }
    }

    @Transactional
    protected void createAdminAccount() {
        Optional<Role> adminRole = roleRepository.findByRoleName("ADMIN");
        if (adminRole.isPresent()) {
            // Create Account first
            Account account = new Account();
            account.setUsername("admin");
            String rawPassword = "Admin@123";
            String encodedPassword = passwordEncoder.encode(rawPassword);
            account.setPassword(encodedPassword);
            account.setActive(true);
            account.setRole(adminRole.get());
            
            // Save the account first
            account = accountRepository.save(account);
            log.info("Created account with ID: {}", account.getAccountID());
            
            // Create and save Admin profile
            Admin admin = new Admin();
            admin.setFullName("System Administrator");
            admin.setEmail("admin@movieojt.com");
            admin.setAccount(account);
            admin = adminRepository.save(admin);
            log.info("Created admin profile with ID: {}", admin.getAdminID());
            
            // Update account with admin reference
            account.setAdmin(admin);
            account = accountRepository.save(account);
            
            verifyAdminAccount(account);
        } else {
            log.error("ADMIN role not found!");
        }
    }

    private void verifyAdminAccount(Account account) {
        log.info("Verifying admin account...");
        log.info("Username: {}", account.getUsername());
        log.info("Active: {}", account.getActive());
        log.info("Role: {}", account.getRole().getRoleName());
        log.info("Admin Profile: {}", account.getAdmin() != null ? "Present" : "Missing");
        if (account.getAdmin() != null) {
            log.info("Admin Full Name: {}", account.getAdmin().getFullName());
            log.info("Admin Email: {}", account.getAdmin().getEmail());
        }
        log.info("Password matches: {}", passwordEncoder.matches("Admin@123", account.getPassword()));
    }
} 