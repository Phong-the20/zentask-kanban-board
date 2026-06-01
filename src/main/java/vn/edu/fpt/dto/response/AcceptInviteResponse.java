package vn.edu.fpt.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcceptInviteResponse {

    private String message;
    private String workspaceName;
    private Long workspaceId;
}
