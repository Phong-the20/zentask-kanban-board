package vn.edu.fpt.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.response.AttachmentResponse;
import vn.edu.fpt.entity.Task;
import vn.edu.fpt.entity.TaskAttachment;
import vn.edu.fpt.repository.AttachmentRepository;
import vn.edu.fpt.repository.TaskRepository;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final WorkspaceService workspaceService;

    private final Path uploadDir = Paths.get("uploads", "attachments");

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @Transactional
    public TaskAttachment uploadFile(Long taskId, MultipartFile file) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        workspaceService.checkMembership(
                task.getColumn().getBoard().getWorkspace().getId()
        );

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.'));
        }
        String storedName = UUID.randomUUID().toString() + extension;
        Path targetPath = uploadDir.resolve(storedName);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }

        TaskAttachment attachment = TaskAttachment.builder()
                .task(task)
                .fileName(originalName)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .filePath(storedName)
                .build();

        attachment = attachmentRepository.save(attachment);

        return attachment;
    }

    public List<AttachmentResponse> getAttachmentMetadata(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        workspaceService.checkMembership(
                task.getColumn().getBoard().getWorkspace().getId()
        );

        List<Object[]> rows = attachmentRepository.findAttachmentMetadataByTaskId(taskId);
        return rows.stream().map(r -> AttachmentResponse.builder()
                .id((Long) r[0])
                .fileName((String) r[1])
                .fileType((String) r[2])
                .fileSize((Long) r[3])
                .createdAt((LocalDateTime) r[4])
                .build()
        ).collect(Collectors.toList());
    }

    public String getOriginalFileName(Long attachmentId) {
        String name = attachmentRepository.findFileNameById(attachmentId);
        if (name == null) throw new RuntimeException("Attachment not found");
        return name;
    }

    public Resource loadFileAsResource(Long attachmentId) {
        String filePath = attachmentRepository.findFilePathById(attachmentId);
        if (filePath == null) throw new RuntimeException("Attachment not found");

        Path resolvedPath = uploadDir.resolve(filePath).normalize();
        try {
            Resource resource = new UrlResource(resolvedPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("File not found on disk: " + resolvedPath);
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("File path error: " + resolvedPath, e);
        }
    }

    @Transactional
    public void deleteAttachment(Long attachmentId) {
        TaskAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        workspaceService.checkMembership(
                attachment.getTask().getColumn().getBoard().getWorkspace().getId()
        );

        try {
            Path filePath = uploadDir.resolve(attachment.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {}

        attachmentRepository.delete(attachment);
    }
}
