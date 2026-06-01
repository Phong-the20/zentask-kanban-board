import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { Workspace, WorkspaceMember } from '../types';

export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: () => api.get('/workspaces').then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useWorkspace(id: number | null) {
  return useQuery<Workspace>({
    queryKey: ['workspace', id],
    queryFn: () => api.get(`/workspaces/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useWorkspaceMembers(workspaceId: number | null) {
  return useQuery<WorkspaceMember[]>({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () =>
      api.get(`/workspaces/${workspaceId}/members`).then((r) => r.data),
    enabled: !!workspaceId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
