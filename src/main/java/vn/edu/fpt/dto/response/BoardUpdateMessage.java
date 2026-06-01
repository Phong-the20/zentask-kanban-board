package vn.edu.fpt.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardUpdateMessage {

    private String type;
    private Long boardId;
    private Object data;
}
