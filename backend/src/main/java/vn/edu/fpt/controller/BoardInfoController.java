package vn.edu.fpt.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.response.BoardResponse;
import vn.edu.fpt.service.BoardService;

@RestController
@RequestMapping("/api/v1/boards")
@RequiredArgsConstructor
public class BoardInfoController {

    private final BoardService boardService;

    @GetMapping("/{boardId}")
    public ResponseEntity<BoardResponse> getBoard(@PathVariable Long boardId) {
        return ResponseEntity.ok(boardService.getBoard(boardId));
    }
}
