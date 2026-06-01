import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { Analytics } from '../types';

export function useAnalytics(workspaceId: number | null) {
  return useQuery<Analytics>({
    queryKey: ['analytics', workspaceId],
    queryFn: () =>
      api.get(`/workspaces/${workspaceId}/analytics`).then((r) => r.data),
    enabled: !!workspaceId,
  });
}
