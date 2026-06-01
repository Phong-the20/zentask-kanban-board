package vn.edu.fpt.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class WorkspaceMemberId implements Serializable {

    private Long workspace;
    private Long user;
}
