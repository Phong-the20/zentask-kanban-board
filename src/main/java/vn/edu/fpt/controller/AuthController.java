package vn.edu.fpt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.request.*;
import vn.edu.fpt.dto.response.AuthResponse;
import vn.edu.fpt.dto.response.OtpResponse;
import vn.edu.fpt.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/send-otp")
    public ResponseEntity<OtpResponse> sendRegistrationOtp(@Valid @RequestBody SendOtpRequest request) {
        return ResponseEntity.ok(authService.sendRegistrationOtp(request.getEmail()));
    }

    @PostMapping("/register/verify")
    public ResponseEntity<AuthResponse> verifyRegistrationOtp(@Valid @RequestBody RegisterVerifyRequest request) {
        AuthResponse response = authService.verifyRegistrationOtp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/password-reset/send-otp")
    public ResponseEntity<OtpResponse> sendPasswordResetOtp(@Valid @RequestBody SendOtpRequest request) {
        return ResponseEntity.ok(authService.sendPasswordResetOtp(request.getEmail()));
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<OtpResponse> confirmPasswordReset(@Valid @RequestBody ResetPasswordConfirmRequest request) {
        return ResponseEntity.ok(authService.confirmPasswordReset(request));
    }
}
