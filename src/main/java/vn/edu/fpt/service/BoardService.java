package vn.edu.fpt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.request.CreateBoardRequest;
import vn.edu.fpt.dto.response.BoardResponse;
import vn.edu.fpt.entity.Board;
import vn.edu.fpt.entity.Workspace;
import vn.edu.fpt.repository.BoardRepository;
import vn.edu.fpt.repository.TaskColumnRepository;
import vn.edu.fpt.repository.WorkspaceRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final WorkspaceRepository workspaceRepository;
    private final TaskColumnRepository columnRepository;
    private final WorkspaceService workspaceService;

    @Transactional
    public BoardResponse createBoard(Long workspaceId, CreateBoardRequest request) {
        workspaceService.checkMembership(workspaceId);

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        Board board = Board.builder()
                .workspace(workspace)
                .title(request.getTitle())
                .build();
        board = boardRepository.save(board);

        return toBoardResponse(board);
    }

    @Cacheable(value = "boards", key = "#boardId")
    public BoardResponse getBoard(Long boardId) {
        Board board = findBoardOrThrow(boardId);
        workspaceService.checkMembership(board.getWorkspace().getId());
        return toBoardResponse(board);
    }

    public List<BoardResponse> getBoardsByWorkspace(Long workspaceId) {
        workspaceService.checkMembership(workspaceId);
        return boardRepository.findByWorkspaceIdOrderByCreatedAtAsc(workspaceId)
                .stream()
                .map(this::toBoardResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "boards", key = "#boardId")
    public BoardResponse updateBoard(Long boardId, CreateBoardRequest request) {
        Board board = findBoardOrThrow(boardId);
        workspaceService.checkMembership(board.getWorkspace().getId());

        board.setTitle(request.getTitle());
        board = boardRepository.save(board);

        return toBoardResponse(board);
    }

    @Transactional
    @CacheEvict(value = "boards", key = "#boardId")
    public void deleteBoard(Long boardId) {
        Board board = findBoardOrThrow(boardId);
        workspaceService.checkAdminOrThrow(board.getWorkspace().getId());
        boardRepository.delete(board);
    }

    private Board findBoardOrThrow(Long boardId) {
        return boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
    }

    private BoardResponse toBoardResponse(Board board) {
        return BoardResponse.builder()
                .id(board.getId())
                .title(board.getTitle())
                .workspaceId(board.getWorkspace().getId())
                .columnCount(columnRepository.countByBoardId(board.getId()))
                .createdAt(board.getCreatedAt())
                .build();
    }
}
