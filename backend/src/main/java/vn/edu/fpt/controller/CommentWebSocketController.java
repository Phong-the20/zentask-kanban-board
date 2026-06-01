package vn.edu.fpt.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import vn.edu.fpt.dto.request.CommentMessage;
import vn.edu.fpt.dto.response.CommentResponse;
import vn.edu.fpt.service.CommentService;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class CommentWebSocketController {

    private final CommentService commentService;

    @MessageMapping("/tasks/{taskId}/comments/add")
    @SendTo("/topic/tasks/{taskId}/comments")
    public CommentResponse handleAddComment(@DestinationVariable Long taskId,
                                            @Payload CommentMessage message,
                                            Principal principal) {
        message.setTaskId(taskId);
        if (principal != null) {
            message.setUserId(Long.valueOf(principal.getName()));
        }
        return commentService.addComment(message, principal);
    }
}
