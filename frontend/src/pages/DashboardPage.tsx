import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { Workspace } from '../types';
import WorkspaceAnalytics from '../components/WorkspaceAnalytics';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [analyticsWsId, setAnalyticsWsId] = useState<number | null>(null);

  const { data: workspaces, isLoading } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: () => api.get('/workspaces').then((r) => r.data),
  });

  const handleCreateWorkspace = () => {
    const name = prompt('Workspace name:');
    if (!name?.trim()) return;
    api
      .post('/workspaces', { name: name.trim() })
      .then((res) => {
        const ws = res.data;
        navigate(`/workspace/${ws.id}`);
      })
      .catch(() => alert('Failed to create workspace'));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button onClick={handleCreateWorkspace} className="btn-primary text-sm">
          + New Workspace
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          Loading workspaces...
        </div>
      ) : workspaces && workspaces.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
              >
                <div onClick={() => navigate(`/workspace/${ws.id}`)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-lg font-bold">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{ws.name}</h3>
                      <p className="text-sm text-gray-500">
                        {ws.memberCount} member{ws.memberCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {ws.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{ws.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setAnalyticsWsId(ws.id)}
                  className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  View Analytics
                </button>
              </div>
            ))}
          </div>

          {analyticsWsId && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Workspace Analytics
                </h2>
                <select
                  className="input-field text-sm w-auto"
                  value={analyticsWsId}
                  onChange={(e) => setAnalyticsWsId(Number(e.target.value))}
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>
              <WorkspaceAnalytics workspaceId={analyticsWsId} />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Welcome to ZenTask!
          </h2>
          <p className="text-gray-500 mb-6">
            Create your first workspace to get started.
          </p>
          <button onClick={handleCreateWorkspace} className="btn-primary">
            + New Workspace
          </button>
        </div>
      )}
    </div>
  );
}
