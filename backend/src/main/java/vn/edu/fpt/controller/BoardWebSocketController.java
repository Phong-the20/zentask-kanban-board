package vn.edu.fpt.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import vn.edu.fpt.dto.request.MoveTaskMessage;
import vn.edu.fpt.dto.request.MoveTaskRequest;
import vn.edu.fpt.dto.request.UpdateTaskMessage;
import vn.edu.fpt.dto.request.UpdateTaskRequest;
import vn.edu.fpt.dto.response.BoardUpdateMessage;
import vn.edu.fpt.service.TaskService;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class BoardWebSocketController {

    private final TaskService taskService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/board/move-task")
    public void handleMoveTask(@Payload MoveTaskMessage message, Principal principal) {
        MoveTaskRequest request = MoveTaskRequest.builder()
                .targetColumnId(message.getTargetColumnId())
                .newPosition(message.getNewPosition())
                .build();

        taskService.moveTask(message.getTaskId(), request, principal);

        BoardUpdateMessage update = BoardUpdateMessage.builder()
                .type("TASK_MOVED")
                .boardId(message.getBoardId())
                .data(message)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/board/" + message.getBoardId(),
                update
        );
    }

    @MessageMapping("/board/update-task")
    public void handleUpdateTask(@Payload UpdateTaskMessage message, Principal principal) {
        UpdateTaskRequest request = UpdateTaskRequest.builder()
                .title(message.getTitle())
                .description(message.getDescription())
                .priority(message.getPriority())
                .deadline(message.getDeadline())
                .assigneeId(message.getAssigneeId())
                .build();

        taskService.updateTask(message.getTaskId(), request);

        BoardUpdateMessage update = BoardUpdateMessage.builder()
                .type("TASK_UPDATED")
                .boardId(message.getBoardId())
                .data(message)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/board/" + message.getBoardId(),
                update
        );
    }
}
