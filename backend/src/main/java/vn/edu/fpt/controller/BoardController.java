package vn.edu.fpt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.request.CreateBoardRequest;
import vn.edu.fpt.dto.response.BoardResponse;
import vn.edu.fpt.service.BoardService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @PostMapping
    public ResponseEntity<BoardResponse> createBoard(
            @PathVariable Long workspaceId,
            @Valid @RequestBody CreateBoardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(boardService.createBoard(workspaceId, request));
    }

    @GetMapping
    public ResponseEntity<List<BoardResponse>> getBoardsByWorkspace(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(boardService.getBoardsByWorkspace(workspaceId));
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<BoardResponse> getBoard(@PathVariable Long boardId) {
        return ResponseEntity.ok(boardService.getBoard(boardId));
    }

    @PutMapping("/{boardId}")
    public ResponseEntity<BoardResponse> updateBoard(
            @PathVariable Long boardId,
            @Valid @RequestBody CreateBoardRequest request) {
        return ResponseEntity.ok(boardService.updateBoard(boardId, request));
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long boardId) {
        boardService.deleteBoard(boardId);
        return ResponseEntity.noContent().build();
    }
}
