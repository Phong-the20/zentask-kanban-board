package vn.edu.fpt.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoveTaskMessage {

    private Long taskId;
    private Long targetColumnId;
    private Integer newPosition;
    private Long boardId;
}
