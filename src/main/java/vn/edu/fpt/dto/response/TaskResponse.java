package vn.edu.fpt.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private String priority;
    private LocalDateTime deadline;
    private Long assigneeId;
    private String assigneeName;
    private Long columnId;
    private Integer positionIndex;
    private long commentCount;
    private long attachmentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
