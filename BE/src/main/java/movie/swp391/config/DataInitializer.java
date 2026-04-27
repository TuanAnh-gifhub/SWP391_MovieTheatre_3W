package movie.swp391.config;

import lombok.extern.slf4j.Slf4j;
import movie.swp391.entity.Role;
import movie.swp391.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
@Order(1)
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting role initialization...");
        List<String> roles = List.of("ADMIN", "EMPLOYEE", "CUSTOMER");

        for (String roleName : roles) {
            if (roleRepository.findByRoleName(roleName).isEmpty()) {
                log.info("Creating role: {}", roleName);
                Role role = new Role();
                role.setRoleName(roleName);
                roleRepository.save(role);
            } else {
                log.info("Role {} already exists", roleName);
            }
        }
        log.info("Role initialization completed");


    }
}
