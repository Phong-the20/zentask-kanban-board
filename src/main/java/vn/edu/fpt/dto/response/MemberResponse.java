package vn.edu.fpt.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberResponse {

    private Long userId;
    private String fullName;
    private String email;
    private String role;
}
