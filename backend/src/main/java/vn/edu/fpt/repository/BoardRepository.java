package vn.edu.fpt.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.fpt.entity.Board;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByWorkspaceIdOrderByCreatedAtAsc(Long workspaceId);
    long countByWorkspaceId(Long workspaceId);
}
