import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api, { getToken } from '../api/client';
import type { Comment } from '../types';

export function useTaskComments(taskId: number | null) {
  const queryClient = useQueryClient();
  const clientRef = useRef<Client | null>(null);
  const tokenRef = useRef<string | null>(null);

  const query = useQuery<Comment[]>({
    queryKey: ['task-comments', taskId],
    queryFn: () => api.get(`/tasks/${taskId}/comments`).then((r) => r.data),
    enabled: !!taskId,
  });

  useEffect(() => {
    if (!taskId) return;

    const token = getToken();
    tokenRef.current = token;
    const connectHeaders: Record<string, string> = {};
    if (token) {
      connectHeaders.Authorization = `Bearer ${token}`;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe(`/topic/tasks/${taskId}/comments`, (message) => {
          try {
            const newComment: Comment = JSON.parse(message.body);
            queryClient.setQueryData<Comment[]>(['task-comments', taskId], (old) => {
              if (!old) return [newComment];
              if (old.some((c) => c.id === newComment.id)) return old;
              return [...old, newComment];
            });
          } catch { /* ignore parse errors */ }
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [taskId, queryClient]);

  const addComment = useCallback(
    (content: string) => {
      if (!taskId || !content.trim()) return;
      const client = clientRef.current;
      const token = tokenRef.current;
      if (client?.connected) {
        client.publish({
          destination: `/app/tasks/${taskId}/comments/add`,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: JSON.stringify({ content: content.trim() }),
        });
      }
    },
    [taskId],
  );

  return { ...query, addComment };
}
