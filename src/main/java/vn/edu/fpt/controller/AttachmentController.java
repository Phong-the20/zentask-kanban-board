package vn.edu.fpt.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.response.AttachmentResponse;
import vn.edu.fpt.entity.TaskAttachment;
import vn.edu.fpt.service.AttachmentService;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping("/api/v1/tasks/{taskId}/attachments")
    public ResponseEntity<TaskAttachment> uploadFile(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file) {
        TaskAttachment attachment = attachmentService.uploadFile(taskId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
    }

    @GetMapping("/api/v1/tasks/{taskId}/attachments")
    public ResponseEntity<List<AttachmentResponse>> getAttachments(@PathVariable Long taskId) {
        List<AttachmentResponse> attachments = attachmentService.getAttachmentMetadata(taskId);
        return ResponseEntity.ok(attachments);
    }

    @GetMapping("/api/v1/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long attachmentId) {
        Resource resource = attachmentService.loadFileAsResource(attachmentId);
        String originalName = attachmentService.getOriginalFileName(attachmentId);

        String contentType = guessContentType(originalName);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + originalName + "\"")
                .body(resource);
    }

    @DeleteMapping("/api/v1/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) {
        attachmentService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }

    private String guessContentType(String filename) {
        if (filename == null) return "application/octet-stream";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "application/msword";
        if (lower.endsWith(".xls") || lower.endsWith(".xlsx")) return "application/vnd.ms-excel";
        if (lower.endsWith(".zip")) return "application/zip";
        if (lower.endsWith(".txt")) return "text/plain";
        if (lower.endsWith(".json")) return "application/json";
        if (lower.endsWith(".mp4")) return "video/mp4";
        return "application/octet-stream";
    }
}
