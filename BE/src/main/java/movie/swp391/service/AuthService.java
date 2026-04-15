package movie.swp391.service;

import movie.swp391.request.auth.LoginRequest;
import movie.swp391.request.auth.RegisterRequest;
import movie.swp391.response.auth.LoginResponse;
import org.springframework.http.ResponseEntity;

public interface AuthService {

    ResponseEntity<LoginResponse> login(LoginRequest request);

    ResponseEntity<String> register(RegisterRequest request);

}
