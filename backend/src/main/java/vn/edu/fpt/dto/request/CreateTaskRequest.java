package vn.edu.fpt.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTaskRequest {

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;

    @Builder.Default
    private String priority = "MEDIUM";

    private LocalDateTime deadline;

    private Long assigneeId;
}
