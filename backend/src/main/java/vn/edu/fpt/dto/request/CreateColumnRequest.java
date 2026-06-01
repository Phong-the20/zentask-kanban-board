package vn.edu.fpt.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateColumnRequest {

    @NotBlank(message = "Column name is required")
    private String name;
}
