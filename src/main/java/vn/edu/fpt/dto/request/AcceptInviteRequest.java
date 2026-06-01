package vn.edu.fpt.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcceptInviteRequest {

    @NotBlank(message = "Token is required")
    private String token;
}
