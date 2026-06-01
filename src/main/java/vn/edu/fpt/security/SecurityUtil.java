package vn.edu.fpt.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import vn.edu.fpt.entity.User;
import vn.edu.fpt.repository.UserRepository;

import java.security.Principal;

@Component
@RequiredArgsConstructor
public class SecurityUtil {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        Long userId = Long.valueOf(auth.getName());
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Current user not found in database"));
    }

    public User getCurrentUser(Principal principal) {
        if (principal instanceof Authentication auth && auth.isAuthenticated()) {
            Long userId = Long.valueOf(auth.getName());
            return userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Current user not found in database"));
        }
        return getCurrentUser();
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
