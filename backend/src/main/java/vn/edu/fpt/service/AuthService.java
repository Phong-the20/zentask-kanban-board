package vn.edu.fpt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.request.LoginRequest;
import vn.edu.fpt.dto.request.RegisterRequest;
import vn.edu.fpt.dto.request.RegisterVerifyRequest;
import vn.edu.fpt.dto.request.ResetPasswordConfirmRequest;
import vn.edu.fpt.dto.response.AuthResponse;
import vn.edu.fpt.dto.response.OtpResponse;
import vn.edu.fpt.entity.User;
import vn.edu.fpt.repository.UserRepository;
import vn.edu.fpt.security.JwtUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;
    private final EmailService emailService;

    public OtpResponse sendRegistrationOtp(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use");
        }
        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp, "Registration");
        return OtpResponse.builder().message("OTP sent to your email").build();
    }

    @Transactional
    public AuthResponse verifyRegistrationOtp(RegisterVerifyRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        if (!otpService.validateOtp(request.getEmail(), request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        otpService.clearOtp(request.getEmail());

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .provider("local")
                .build();

        user = userRepository.save(user);

        String token = jwtUtils.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .build();
    }

    public OtpResponse sendPasswordResetOtp(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email not found");
        }
        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp, "Password Reset");
        return OtpResponse.builder().message("OTP sent to your email").build();
    }

    @Transactional
    public OtpResponse confirmPasswordReset(ResetPasswordConfirmRequest request) {
        if (!otpService.validateOtp(request.getEmail(), request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        otpService.clearOtp(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return OtpResponse.builder().message("Password reset successful").build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .provider("local")
                .build();

        user = userRepository.save(user);

        String token = jwtUtils.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtils.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .build();
    }
}
