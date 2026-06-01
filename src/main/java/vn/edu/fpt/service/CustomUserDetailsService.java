package vn.edu.fpt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import vn.edu.fpt.entity.User;
import vn.edu.fpt.repository.UserRepository;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user;

        if (identifier.matches("\\d+")) {
            user = userRepository.findById(Long.valueOf(identifier))
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + identifier));
        } else {
            user = userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + identifier));
        }

        return new org.springframework.security.core.userdetails.User(
                user.getId().toString(),
                user.getPassword() != null ? user.getPassword() : "",
                Collections.emptyList()
        );
    }
}
