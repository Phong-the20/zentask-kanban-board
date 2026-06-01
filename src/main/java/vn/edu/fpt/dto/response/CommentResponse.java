package vn.edu.fpt.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {

    private Long id;
    private Long taskId;
    private Long userId;
    private String userName;
    private String userAvatar;
    private String content;
    private LocalDateTime createdAt;
}
