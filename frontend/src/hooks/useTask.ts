import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { Task } from '../types';

export function useTasksByColumn(columnId: number | null) {
  return useQuery<Task[]>({
    queryKey: ['tasks', columnId],
    queryFn: () =>
      api.get(`/columns/${columnId}/tasks`).then((r) => r.data),
    enabled: !!columnId,
  });
}

export function useDeleteTask(boardId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => api.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-tasks', boardId] });
    },
  });
}

export function useUpdateTask(boardId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      ...data
    }: {
      taskId: number;
      title?: string;
      description?: string | null;
      priority?: string;
      deadline?: string | null;
      assigneeId?: number | null;
    }) => api.put(`/tasks/${taskId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-tasks', boardId] });
    },
  });
}
