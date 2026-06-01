package vn.edu.fpt.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoveTaskRequest {

    @NotNull
    private Long targetColumnId;

    private Integer newPosition;
}
