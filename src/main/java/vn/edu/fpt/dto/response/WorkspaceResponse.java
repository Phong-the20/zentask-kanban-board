package vn.edu.fpt.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceResponse {

    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private String ownerName;
    private long memberCount;
    private LocalDateTime createdAt;
}
