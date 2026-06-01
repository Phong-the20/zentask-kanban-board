package vn.edu.fpt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.request.CreateTaskRequest;
import vn.edu.fpt.dto.request.MoveTaskRequest;
import vn.edu.fpt.dto.request.UpdateTaskRequest;
import vn.edu.fpt.dto.response.TaskResponse;
import vn.edu.fpt.entity.*;
import vn.edu.fpt.repository.*;

import java.security.Principal;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskColumnRepository columnRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;
    private final WorkspaceService workspaceService;
    private final EmailService emailService;

    @Transactional
    @CacheEvict(value = "boardColumns", allEntries = true)
    public TaskResponse createTask(Long columnId, CreateTaskRequest request) {
        TaskColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));
        workspaceService.checkMembership(column.getBoard().getWorkspace().getId());

        long nextPosition = taskRepository.countByColumnId(columnId);

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
        }

        Priority priority;
        try {
            priority = Priority.valueOf(request.getPriority().toUpperCase());
        } catch (IllegalArgumentException e) {
            priority = Priority.MEDIUM;
        }

        Task task = Task.builder()
                .column(column)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(priority)
                .deadline(request.getDeadline())
                .assignee(assignee)
                .positionIndex((int) nextPosition)
                .build();
        task = taskRepository.save(task);

        return toTaskResponse(task);
    }

    public List<TaskResponse> getTasksByColumn(Long columnId) {
        TaskColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));
        workspaceService.checkMembership(column.getBoard().getWorkspace().getId());

        return taskRepository.findByColumnIdOrderByPositionIndexAsc(columnId)
                .stream()
                .map(this::toTaskResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse getTask(Long taskId) {
        Task task = findTaskOrThrow(taskId);
        workspaceService.checkMembership(task.getColumn().getBoard().getWorkspace().getId());
        return toTaskResponse(task);
    }

    @Transactional
    @CacheEvict(value = "boardColumns", allEntries = true)
    public TaskResponse updateTask(Long taskId, UpdateTaskRequest request) {
        Task task = findTaskOrThrow(taskId);
        workspaceService.checkMembership(task.getColumn().getBoard().getWorkspace().getId());

        Long oldAssigneeId = task.getAssignee() != null ? task.getAssignee().getId() : null;

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getDeadline() != null) task.setDeadline(request.getDeadline());
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        }
        if (request.getPriority() != null) {
            try {
                task.setPriority(Priority.valueOf(request.getPriority().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }

        task = taskRepository.save(task);

        Long newAssigneeId = task.getAssignee() != null ? task.getAssignee().getId() : null;
        if (newAssigneeId != null && !Objects.equals(oldAssigneeId, newAssigneeId)) {
            User assignee = task.getAssignee();
            String boardName = task.getColumn().getBoard().getTitle();
            emailService.sendAssignmentNotification(
                    assignee.getEmail(),
                    task.getTitle(),
                    boardName
            );
        }

        return toTaskResponse(task);
    }

    @Transactional
    @CacheEvict(value = "boardColumns", allEntries = true)
    public void deleteTask(Long taskId) {
        Task task = findTaskOrThrow(taskId);
        workspaceService.checkAdminOrThrow(task.getColumn().getBoard().getWorkspace().getId());
        taskRepository.delete(task);
    }

    @Transactional
    public void deleteTask(Long taskId, Principal principal) {
        Task task = findTaskWithDetailsOrThrow(taskId);
        workspaceService.checkMembership(
                task.getColumn().getBoard().getWorkspace().getId(), principal);
        taskRepository.delete(task);
    }

    @CacheEvict(value = "boardColumns", allEntries = true)
    public TaskResponse moveTask(Long taskId, MoveTaskRequest request) {
        return moveTask(taskId, request, null);
    }

    @Transactional
    public TaskResponse moveTask(Long taskId, MoveTaskRequest request, Principal principal) {
        Task task = findTaskWithDetailsOrThrow(taskId);
        Long workspaceId = task.getColumn().getBoard().getWorkspace().getId();

        if (principal != null) {
            workspaceService.checkMembership(workspaceId, principal);
        } else {
            workspaceService.checkMembership(workspaceId);
        }

        TaskColumn targetColumn = columnRepository.findById(request.getTargetColumnId())
                .orElseThrow(() -> new RuntimeException("Target column not found"));

        task.setColumn(targetColumn);
        if (request.getNewPosition() != null) {
            task.setPositionIndex(request.getNewPosition());
        } else {
            task.setPositionIndex((int) taskRepository.countByColumnId(targetColumn.getId()));
        }

        task = taskRepository.save(task);
        return toTaskResponse(task);
    }

    private Task findTaskOrThrow(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    private Task findTaskWithDetailsOrThrow(Long taskId) {
        return taskRepository.findByIdWithDetails(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    private TaskResponse toTaskResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority().name())
                .deadline(task.getDeadline())
                .assigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                .assigneeName(task.getAssignee() != null ? task.getAssignee().getFullName() : null)
                .columnId(task.getColumn().getId())
                .positionIndex(task.getPositionIndex())
                .commentCount(commentRepository.countByTaskId(task.getId()))
                .attachmentCount(attachmentRepository.countByTaskId(task.getId()))
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
