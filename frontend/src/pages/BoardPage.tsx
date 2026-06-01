import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import KanbanBoard from '../components/kanban/KanbanBoard';
import InviteMemberModal from '../components/InviteMemberModal';
import { useBoard } from '../hooks/useBoard';
import type { TaskColumn, Task } from '../types';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const numericId = boardId ? Number(boardId) : null;
  const queryClient = useQueryClient();

  const [newColName, setNewColName] = useState('');
  const [showColForm, setShowColForm] = useState(false);
  const [creatingCol, setCreatingCol] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const { data: board } = useBoard(numericId);

  const { data: columns, isLoading: columnsLoading } = useQuery<TaskColumn[]>({
    queryKey: ['columns', numericId],
    queryFn: () => api.get(`/boards/${numericId}/columns`).then((r) => r.data),
    enabled: !!numericId,
  });

  const columnIds = columns?.map((c) => c.id) ?? [];

  const { data: allTasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['board-tasks', numericId],
    queryFn: async () => {
      if (!columnIds.length) return [];
      const results = await Promise.all(
        columnIds.map((colId) =>
          api.get(`/columns/${colId}/tasks`).then((r) => r.data)
        )
      );
      return results.flat();
    },
    enabled: !!numericId && columnIds.length > 0,
  });

  const handleCreateColumn = async () => {
    if (!newColName.trim() || !numericId) return;
    setCreatingCol(true);
    try {
      await api.post(`/boards/${numericId}/columns`, { name: newColName.trim() });
      setNewColName('');
      setShowColForm(false);
      queryClient.invalidateQueries({ queryKey: ['columns', numericId] });
    } catch {
      alert('Failed to create column');
    } finally {
      setCreatingCol(false);
    }
  };

  const handleTaskCreated = () => {
    if (!numericId) return;
    queryClient.invalidateQueries({ queryKey: ['board-tasks', numericId] });
  };

  const handleDeleteBoard = async () => {
    if (!numericId || !board?.workspaceId) return;
    if (!window.confirm("Are you sure you want to permanently delete this entire board?")) return;
    setDeleting(true);
    try {
      await api.delete(`/workspaces/${board.workspaceId}/boards/${numericId}`);
      queryClient.invalidateQueries({ queryKey: ['boards', board.workspaceId] });
      navigate('/dashboard');
    } catch {
      alert('Failed to delete board');
      setDeleting(false);
    }
  };

  const tasksByColumn: Record<number, Task[]> = {};
  if (columns && allTasks) {
    for (const col of columns) {
      tasksByColumn[col.id] =
        allTasks
          .filter((t) => t.columnId === col.id)
          .sort((a, b) => a.positionIndex - b.positionIndex) ?? [];
    }
  }

  const anyLoading = columnsLoading || tasksLoading;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Invite Member
          </button>

          {!showColForm ? (
            <button
              onClick={() => setShowColForm(true)}
              className="btn-primary text-sm"
            >
              + Add Column
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                className="input-field w-48 text-sm"
                placeholder="Column name (e.g. Todo)"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateColumn()}
                autoFocus
              />
              <button
                onClick={handleCreateColumn}
                disabled={creatingCol}
                className="btn-primary text-sm"
              >
                {creatingCol ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={() => { setShowColForm(false); setNewColName(''); }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          )}

          {anyLoading && (
            <span className="text-xs text-gray-400 ml-auto">Refreshing...</span>
          )}

          <button
            onClick={handleDeleteBoard}
            disabled={deleting}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {deleting ? 'Deleting...' : 'Delete Board'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {anyLoading && !columns ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading board...
          </div>
        ) : !columns || columns.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No columns yet</p>
              <p className="text-sm">Click "Add Column" above to get started.</p>
            </div>
          </div>
        ) : (
          <KanbanBoard
            boardId={numericId!}
            columns={columns}
            initialTasks={tasksByColumn}
            onTaskCreated={handleTaskCreated}
          />
        )}
      </div>

      {showInviteModal && board?.workspaceId && (
        <InviteMemberModal
          workspaceId={board.workspaceId}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => queryClient.invalidateQueries({ queryKey: ['workspaces'] })}
        />
      )}
    </div>
  );
}
