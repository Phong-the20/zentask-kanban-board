package vn.edu.fpt.dto.request;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateTaskMessage {

    private Long taskId;
    private Long boardId;
    private String title;
    private String description;
    private String priority;
    private LocalDateTime deadline;
    private Long assigneeId;
}
