package vn.edu.fpt.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.fpt.entity.TaskColumn;

import java.util.List;

public interface TaskColumnRepository extends JpaRepository<TaskColumn, Long> {
    List<TaskColumn> findByBoardIdOrderByPositionIndexAsc(Long boardId);
    long countByBoardId(Long boardId);

    @Query("SELECT c FROM TaskColumn c WHERE c.board.id IN :boardIds ORDER BY c.positionIndex ASC")
    List<TaskColumn> findByBoardIdIn(@Param("boardIds") List<Long> boardIds);
}
