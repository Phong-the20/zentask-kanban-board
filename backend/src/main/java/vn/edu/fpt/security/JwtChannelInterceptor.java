package vn.edu.fpt.security;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private static final String AUTH_ATTR = "SPRING_SECURITY_AUTH";

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return message;

        String token = accessor.getFirstNativeHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            if (jwtUtils.validateToken(token)) {
                Long userId = jwtUtils.getUserIdFromToken(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(userId.toString());
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities()
                        );
                accessor.setUser(authentication);
                if (accessor.getSessionAttributes() != null) {
                    accessor.getSessionAttributes().put(AUTH_ATTR, authentication);
                }
                SecurityContextHolder.getContext().setAuthentication(authentication);
                return message;
            }
        }

        Authentication authentication = null;

        if (accessor.getUser() instanceof Authentication auth && auth.isAuthenticated()) {
            authentication = auth;
        }

        if (authentication == null && accessor.getSessionAttributes() != null) {
            Object stored = accessor.getSessionAttributes().get(AUTH_ATTR);
            if (stored instanceof Authentication auth && auth.isAuthenticated()) {
                authentication = auth;
            }
        }

        if (authentication != null) {
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        return message;
    }
}
