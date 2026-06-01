package vn.edu.fpt.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final long OTP_EXPIRY_MINUTES = 5;
    private static final int OTP_LENGTH = 6;
    private final SecureRandom secureRandom = new SecureRandom();

    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public String generateOtp(String email) {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(secureRandom.nextInt(10));
        }
        String code = otp.toString();
        otpStore.put(email.toLowerCase().trim(), new OtpEntry(code, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
        return code;
    }

    public boolean validateOtp(String email, String otp) {
        OtpEntry entry = otpStore.get(email.toLowerCase().trim());
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiryDate())) {
            otpStore.remove(email.toLowerCase().trim());
            return false;
        }
        return entry.otp().equals(otp);
    }

    public void clearOtp(String email) {
        otpStore.remove(email.toLowerCase().trim());
    }

    private record OtpEntry(String otp, LocalDateTime expiryDate) {}
}
