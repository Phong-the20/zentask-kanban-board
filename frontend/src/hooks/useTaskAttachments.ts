import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { AttachmentResponse } from '../types';

export function useTaskAttachments(taskId: number | null) {
  const queryClient = useQueryClient();

  const query = useQuery<AttachmentResponse[]>({
    queryKey: ['task-attachments', taskId],
    queryFn: () =>
      api.get(`/tasks/${taskId}/attachments`).then((r) => r.data),
    enabled: !!taskId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-attachments', taskId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: number) =>
      api.delete(`/attachments/${attachmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-attachments', taskId] });
    },
  });

  return { ...query, upload: uploadMutation, remove: deleteMutation };
}

export function getAttachmentDownloadUrl(attachmentId: number): string {
  return `/api/v1/attachments/${attachmentId}/download`;
}
