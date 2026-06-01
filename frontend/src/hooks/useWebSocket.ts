import { useEffect, useRef, useCallback } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface UseWebSocketOptions {
  boardId: number | null;
  onBoardUpdate: (message: any) => void;
}

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('zentask-auth');
    if (stored) {
      const { token } = JSON.parse(stored);
      return token || null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function useWebSocket({ boardId, onBoardUpdate }: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!boardId) return;

    const token = getToken();
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
        client.subscribe(`/topic/board/${boardId}`, (message: IMessage) => {
          try {
            const data = JSON.parse(message.body);
            onBoardUpdate(data);
          } catch {
            /* ignore parse errors */
          }
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [boardId, onBoardUpdate]);

  const sendMessage = useCallback(
    (destination: string, body: object) => {
      const client = clientRef.current;
      if (client?.connected) {
        client.publish({
          destination: `/app${destination}`,
          body: JSON.stringify(body),
        });
      }
    },
    []
  );

  return { sendMessage };
}
