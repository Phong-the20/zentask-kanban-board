package vn.edu.fpt.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.fpt.entity.Task;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByColumnIdOrderByPositionIndexAsc(Long columnId);
    long countByColumnId(Long columnId);
    long countByAssigneeId(Long assigneeId);

    @Query("SELECT t FROM Task t JOIN FETCH t.column c JOIN FETCH c.board WHERE t.id = :id")
    Optional<Task> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT t FROM Task t JOIN FETCH t.column WHERE t.column.board.workspace.id = :workspaceId")
    List<Task> findByWorkspaceId(@Param("workspaceId") Long workspaceId);

    List<Task> findByColumnIdIn(List<Long> columnIds);
}
