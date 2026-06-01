package vn.edu.fpt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.request.CommentMessage;
import vn.edu.fpt.dto.response.CommentResponse;
import vn.edu.fpt.entity.Comment;
import vn.edu.fpt.entity.Task;
import vn.edu.fpt.entity.User;
import vn.edu.fpt.repository.CommentRepository;
import vn.edu.fpt.repository.TaskRepository;
import vn.edu.fpt.repository.UserRepository;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WorkspaceService workspaceService;

    @Transactional
    public CommentResponse addComment(CommentMessage message, Principal principal) {
        Task task = taskRepository.findById(message.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        workspaceService.checkMembership(task.getColumn().getBoard().getWorkspace().getId(), principal);

        User user = userRepository.findById(message.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .task(task)
                .user(user)
                .content(message.getContent())
                .build();
        comment = commentRepository.save(comment);

        return toCommentResponse(comment);
    }

    public List<CommentResponse> getCommentsByTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        workspaceService.checkMembership(task.getColumn().getBoard().getWorkspace().getId());

        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList());
    }

    private CommentResponse toCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .taskId(comment.getTask().getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getFullName())
                .userAvatar(comment.getUser().getAvatar())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
