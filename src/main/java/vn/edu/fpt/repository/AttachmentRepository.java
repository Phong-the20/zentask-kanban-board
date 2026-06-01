package vn.edu.fpt.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.fpt.entity.TaskAttachment;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<TaskAttachment, Long> {
    List<TaskAttachment> findByTaskIdOrderByCreatedAtAsc(Long taskId);
    long countByTaskId(Long taskId);

    @Query("SELECT a.id, a.fileName, a.fileType, a.fileSize, a.createdAt FROM TaskAttachment a WHERE a.task.id = :taskId ORDER BY a.createdAt ASC")
    List<Object[]> findAttachmentMetadataByTaskId(@Param("taskId") Long taskId);

    @Query("SELECT a.filePath FROM TaskAttachment a WHERE a.id = :id")
    String findFilePathById(@Param("id") Long id);

    @Query("SELECT a.fileName FROM TaskAttachment a WHERE a.id = :id")
    String findFileNameById(@Param("id") Long id);
}
