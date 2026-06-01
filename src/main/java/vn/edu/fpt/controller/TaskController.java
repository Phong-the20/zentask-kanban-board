package vn.edu.fpt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.request.CreateTaskRequest;
import vn.edu.fpt.dto.request.MoveTaskRequest;
import vn.edu.fpt.dto.request.UpdateTaskRequest;
import vn.edu.fpt.dto.response.TaskResponse;
import vn.edu.fpt.service.TaskService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping("/columns/{columnId}/tasks")
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable Long columnId,
            @Valid @RequestBody CreateTaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(columnId, request));
    }

    @GetMapping("/columns/{columnId}/tasks")
    public ResponseEntity<List<TaskResponse>> getTasksByColumn(@PathVariable Long columnId) {
        return ResponseEntity.ok(taskService.getTasksByColumn(columnId));
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<TaskResponse> getTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.getTask(taskId));
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(taskId, request));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId, Principal principal) {
        taskService.deleteTask(taskId, principal);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/tasks/{taskId}/move")
    public ResponseEntity<TaskResponse> moveTask(
            @PathVariable Long taskId,
            @Valid @RequestBody MoveTaskRequest request) {
        return ResponseEntity.ok(taskService.moveTask(taskId, request));
    }
}
