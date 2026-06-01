package vn.edu.fpt.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardResponse {

    private Long id;
    private String title;
    private Long workspaceId;
    private long columnCount;
    private LocalDateTime createdAt;
}
