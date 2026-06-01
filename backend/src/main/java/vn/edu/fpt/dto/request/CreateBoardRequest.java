package vn.edu.fpt.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBoardRequest {

    @NotBlank(message = "Board title is required")
    private String title;
}
