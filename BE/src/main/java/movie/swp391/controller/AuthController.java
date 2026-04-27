package movie.swp391.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import movie.swp391.request.auth.*;
import movie.swp391.request.ResetPasswordRequest;
import movie.swp391.request.auth.LoginRequest;
import movie.swp391.request.auth.RegisterRequest;
import movie.swp391.response.auth.LoginResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.AccountService;
import movie.swp391.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for user authentication")
public class AuthController {

    private final AuthService authService;
    private final AccountService accountService;

    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "400", description = "Invalid credentials or account locked")
    })
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @Operation(summary = "User registration", description = "Register a new customer account")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Registration successful"),
            @ApiResponse(responseCode = "400", description = "Invalid input or username already exists")
    })
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @Operation(summary = "Reset password", description = "Reset password using email and a new password")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password reset successful"),
            @ApiResponse(responseCode = "400", description = "Email not found or passwords do not match"),
            @ApiResponse(responseCode = "400", description = "Passwords do not match")
    })
    @PostMapping("/reset-password")
    public BaseResponse<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return accountService.resetPassword(request);
    }
}

