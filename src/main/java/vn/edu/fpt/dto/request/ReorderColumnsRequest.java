package vn.edu.fpt.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReorderColumnsRequest {

    @NotNull
    private List<Long> columnIds;
}
