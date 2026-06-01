package vn.edu.fpt.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ColumnResponse {

    private Long id;
    private String name;
    private Integer positionIndex;
    private Long boardId;
    private long taskCount;
    private boolean doneColumn;
    private LocalDateTime createdAt;
}
