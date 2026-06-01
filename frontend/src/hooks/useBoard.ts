import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { Board, TaskColumn } from '../types';

export function useBoards(workspaceId: number | null) {
  return useQuery<Board[]>({
    queryKey: ['boards', workspaceId],
    queryFn: () =>
      api.get(`/workspaces/${workspaceId}/boards`).then((r) => r.data),
    enabled: !!workspaceId,
  });
}

export function useBoard(boardId: number | null) {
  return useQuery<Board>({
    queryKey: ['board', boardId],
    queryFn: () => api.get(`/boards/${boardId}`).then((r) => r.data),
    enabled: !!boardId,
  });
}

export function useBoardColumns(boardId: number | null) {
  return useQuery<TaskColumn[]>({
    queryKey: ['columns', boardId],
    queryFn: () =>
      api.get(`/boards/${boardId}/columns`).then((r) => r.data),
    enabled: !!boardId,
    refetchInterval: false,
  });
}
