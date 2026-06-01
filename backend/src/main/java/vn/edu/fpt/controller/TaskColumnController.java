package vn.edu.fpt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.request.CreateColumnRequest;
import vn.edu.fpt.dto.request.ReorderColumnsRequest;
import vn.edu.fpt.dto.response.ColumnResponse;
import vn.edu.fpt.service.TaskColumnService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/boards/{boardId}/columns")
@RequiredArgsConstructor
public class TaskColumnController {

    private final TaskColumnService taskColumnService;

    @PostMapping
    public ResponseEntity<ColumnResponse> createColumn(
            @PathVariable Long boardId,
            @Valid @RequestBody CreateColumnRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskColumnService.createColumn(boardId, request));
    }

    @GetMapping
    public ResponseEntity<List<ColumnResponse>> getColumnsByBoard(@PathVariable Long boardId) {
        return ResponseEntity.ok(taskColumnService.getColumnsByBoard(boardId));
    }

    @PutMapping("/{columnId}")
    public ResponseEntity<ColumnResponse> updateColumn(
            @PathVariable Long columnId,
            @Valid @RequestBody CreateColumnRequest request) {
        return ResponseEntity.ok(taskColumnService.updateColumn(columnId, request));
    }

    @DeleteMapping("/{columnId}")
    public ResponseEntity<Void> deleteColumn(@PathVariable Long columnId) {
        taskColumnService.deleteColumn(columnId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{columnId}/toggle-done")
    public ResponseEntity<ColumnResponse> toggleDoneColumn(
            @PathVariable Long boardId,
            @PathVariable Long columnId) {
        return ResponseEntity.ok(taskColumnService.toggleDoneColumn(columnId));
    }

    @PutMapping("/reorder")
    public ResponseEntity<List<ColumnResponse>> reorderColumns(
            @PathVariable Long boardId,
            @Valid @RequestBody ReorderColumnsRequest request) {
        return ResponseEntity.ok(taskColumnService.reorderColumns(boardId, request));
    }
}
