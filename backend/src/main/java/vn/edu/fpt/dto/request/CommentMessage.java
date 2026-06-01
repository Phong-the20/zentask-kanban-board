package vn.edu.fpt.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentMessage {

    private Long taskId;
    private Long userId;
    private String content;
}
