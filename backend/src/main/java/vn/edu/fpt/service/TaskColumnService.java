package vn.edu.fpt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.request.CreateColumnRequest;
import vn.edu.fpt.dto.request.ReorderColumnsRequest;
import vn.edu.fpt.dto.response.ColumnResponse;
import vn.edu.fpt.entity.Board;
import vn.edu.fpt.entity.TaskColumn;
import vn.edu.fpt.repository.BoardRepository;
import vn.edu.fpt.repository.TaskColumnRepository;
import vn.edu.fpt.repository.TaskRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskColumnService {

    private final TaskColumnRepository columnRepository;
    private final BoardRepository boardRepository;
    private final TaskRepository taskRepository;
    private final WorkspaceService workspaceService;

    @Transactional
    @CacheEvict(value = "boardColumns", key = "#boardId")
    public ColumnResponse createColumn(Long boardId, CreateColumnRequest request) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        workspaceService.checkMembership(board.getWorkspace().getId());

        long nextPosition = columnRepository.countByBoardId(boardId);

        TaskColumn column = TaskColumn.builder()
                .board(board)
                .name(request.getName())
                .positionIndex((int) nextPosition)
                .build();
        column = columnRepository.save(column);

        return toColumnResponse(column);
    }

    public List<ColumnResponse> getColumnsByBoard(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        workspaceService.checkMembership(board.getWorkspace().getId());

        return columnRepository.findByBoardIdOrderByPositionIndexAsc(boardId)
                .stream()
                .map(this::toColumnResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "boardColumns", allEntries = true)
    public ColumnResponse updateColumn(Long columnId, CreateColumnRequest request) {
        TaskColumn column = findColumnOrThrow(columnId);
        workspaceService.checkMembership(column.getBoard().getWorkspace().getId());

        column.setName(request.getName());
        column = columnRepository.save(column);

        return toColumnResponse(column);
    }

    @Transactional
    @CacheEvict(value = "boardColumns", allEntries = true)
    public void deleteColumn(Long columnId) {
        TaskColumn column = findColumnOrThrow(columnId);
        if (column.isDoneColumn()) {
            throw new RuntimeException("Cannot delete the active Done column. Toggle another column as the done destination first.");
        }
        workspaceService.checkAdminOrThrow(column.getBoard().getWorkspace().getId());
        columnRepository.delete(column);
    }

    @Transactional
    @CacheEvict(value = "boardColumns", key = "#boardId")
    public List<ColumnResponse> reorderColumns(Long boardId, ReorderColumnsRequest request) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        workspaceService.checkMembership(board.getWorkspace().getId());

        List<Long> columnIds = request.getColumnIds();
        for (int i = 0; i < columnIds.size(); i++) {
            int index = i;
            TaskColumn column = columnRepository.findById(columnIds.get(i))
                    .orElseThrow(() -> new RuntimeException("Column not found: " + columnIds.get(index)));
            column.setPositionIndex(index);
            columnRepository.save(column);
        }

        return getColumnsByBoard(boardId);
    }

    private TaskColumn findColumnOrThrow(Long columnId) {
        return columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));
    }

    @Transactional
    @CacheEvict(value = "boardColumns", allEntries = true)
    public ColumnResponse toggleDoneColumn(Long columnId) {
        TaskColumn column = findColumnOrThrow(columnId);
        Long boardId = column.getBoard().getId();
        workspaceService.checkMembership(column.getBoard().getWorkspace().getId());

        boolean newValue = !column.isDoneColumn();
        columnRepository.findByBoardIdOrderByPositionIndexAsc(boardId)
                .forEach(c -> {
                    c.setDoneColumn(false);
                    columnRepository.save(c);
                });
        column.setDoneColumn(newValue);
        column = columnRepository.save(column);

        return toColumnResponse(column);
    }

    private ColumnResponse toColumnResponse(TaskColumn column) {
        return ColumnResponse.builder()
                .id(column.getId())
                .name(column.getName())
                .positionIndex(column.getPositionIndex())
                .boardId(column.getBoard().getId())
                .taskCount(taskRepository.countByColumnId(column.getId()))
                .doneColumn(column.isDoneColumn())
                .createdAt(column.getCreatedAt())
                .build();
    }
}
