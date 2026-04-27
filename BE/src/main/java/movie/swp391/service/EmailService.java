package movie.swp391.service;

import org.springframework.stereotype.Service;

@Service
public interface EmailService {
    void sendPasswordResetEmail(String to, String token);
    void sendVerificationEmail(String to, String token);
    void sendEmployeeAccountInfoEmail(String to, String username, String password);
} 