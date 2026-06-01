import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import type { Workspace, Board } from '../../types';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { selectedWorkspaceId, setSelectedWorkspace, setSelectedBoard } =
    useWorkspaceStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedWorkspace, setExpandedWorkspace] = useState<number | null>(null);

  const { data: workspaces } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: () => api.get('/workspaces').then((r) => r.data),
  });

  const { data: boards } = useQuery<Board[]>({
    queryKey: ['boards', selectedWorkspaceId],
    queryFn: () =>
      api.get(`/workspaces/${selectedWorkspaceId}/boards`).then((r) => r.data),
    enabled: !!selectedWorkspaceId,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (collapsed) {
    return (
      <aside className="w-16 bg-gray-900 text-white flex flex-col items-center py-4 gap-4 shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="text-gray-400 hover:text-white transition"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
          {user?.fullName?.charAt(0).toUpperCase()}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h1 className="text-lg font-bold tracking-tight">ZenTask</h1>
        <button
          onClick={() => setCollapsed(true)}
          className="text-gray-400 hover:text-white transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
          Workspaces
        </p>

        {workspaces?.map((ws) => (
          <div key={ws.id}>
            <button
              onClick={() => {
                setSelectedWorkspace(ws.id);
                setExpandedWorkspace(
                  expandedWorkspace === ws.id ? null : ws.id
                );
              }}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors
                ${
                  selectedWorkspaceId === ws.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <span className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-xs font-bold shrink-0">
                {ws.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{ws.name}</span>
            </button>

            {expandedWorkspace === ws.id && boards && (
              <div className="ml-6 mt-1 space-y-1">
                {boards.map((b) => (
                  <Link
                    key={b.id}
                    to={`/board/${b.id}`}
                    className="block px-2 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors truncate"
                    onClick={() => setSelectedBoard(b.id)}
                  >
                    {b.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-gray-700 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
