import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { Board } from '../types';
import InviteMemberModal from '../components/InviteMemberModal';

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const numericId = workspaceId ? Number(workspaceId) : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  const { data: boards, isLoading } = useQuery<Board[]>({
    queryKey: ['boards', numericId],
    queryFn: () =>
      api.get(`/workspaces/${numericId}/boards`).then((r) => r.data),
    enabled: !!numericId,
  });

  const handleCreateBoard = async () => {
    if (!boardTitle.trim() || !numericId) return;
    try {
      const res = await api.post(`/workspaces/${numericId}/boards`, {
        title: boardTitle.trim(),
      });
      setBoardTitle('');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['boards', numericId] });
      navigate(`/board/${res.data.id}`);
    } catch {
      alert('Failed to create board');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Boards</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInvite(true)}
            className="btn-secondary text-sm"
          >
            + Invite
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-sm"
          >
            + New Board
          </button>
        </div>
      </div>

      {showInvite && numericId && (
        <InviteMemberModal
          workspaceId={numericId}
          onClose={() => setShowInvite(false)}
          onInvited={() => {}}
        />
      )}

      {showForm && (
        <div className="mb-6 flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="Board title"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
            autoFocus
          />
          <button onClick={handleCreateBoard} className="btn-primary text-sm">
            Create
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="btn-secondary text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-500 py-20 text-center">Loading boards...</div>
      ) : boards && boards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/board/${b.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-lg font-bold">
                  {b.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{b.title}</h3>
                  <p className="text-sm text-gray-500">
                    {b.columnCount} column{b.columnCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📌</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No boards yet
          </h2>
          <p className="text-gray-500 mb-6">
            Create your first board to start organizing tasks.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            + New Board
          </button>
        </div>
      )}
    </div>
  );
}
