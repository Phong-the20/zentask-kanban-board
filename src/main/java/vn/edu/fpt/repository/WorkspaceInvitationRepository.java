package vn.edu.fpt.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.fpt.entity.InvitationStatus;
import vn.edu.fpt.entity.WorkspaceInvitation;

import java.util.List;
import java.util.Optional;

public interface WorkspaceInvitationRepository extends JpaRepository<WorkspaceInvitation, Long> {

    Optional<WorkspaceInvitation> findByToken(String token);

    List<WorkspaceInvitation> findByWorkspaceIdAndStatus(Long workspaceId, InvitationStatus status);

    boolean existsByWorkspaceIdAndEmailAndStatus(Long workspaceId, String email, InvitationStatus status);

    Optional<WorkspaceInvitation> findByWorkspaceIdAndEmailAndStatus(Long workspaceId, String email, InvitationStatus status);
}
