import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { TaskColumn, Task } from '../../types';
import api from '../../api/client';
import KanbanCard from './KanbanCard';

interface Props {
  column: TaskColumn;
  tasks: Task[];
  boardId: number;
  onTaskCreated: () => void;
  onCardClick: (task: Task) => void;
}

export default function KanbanColumn({ column, tasks, boardId, onTaskCreated, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${column.id}`,
    data: { column },
  });

  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleDone = useMutation({
    mutationFn: () => api.patch(`/boards/${boardId}/columns/${column.id}/toggle-done`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', boardId] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
      queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
    },
  });

  const deleteCol = useMutation({
    mutationFn: () => api.delete(`/boards/${boardId}/columns/${column.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', boardId] });
    },
  });

  const handleDeleteColumn = () => {
    if (!window.confirm("Are you sure you want to delete this column and all its tasks?")) return;
    deleteCol.mutate();
    setMenuOpen(false);
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    setCreating(true);
    try {
      await api.post(`/columns/${column.id}/tasks`, {
        title: taskTitle.trim(),
      });
      setTaskTitle('');
      setShowForm(false);
      onTaskCreated();
    } catch {
      alert('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`w-72 shrink-0 flex flex-col bg-gray-100 rounded-xl transition-colors ${
        isOver ? 'bg-gray-200 ring-2 ring-primary-400' : ''
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider truncate">
            {column.name}
          </h3>
          {column.doneColumn && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
              Done
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
                {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  {column.doneColumn ? (
                    <div className="px-3 py-2 text-sm text-emerald-700 flex items-center gap-2 cursor-default">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Current Done Destination</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        toggleDone.mutate();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mark as Done Column
                    </button>
                  )}
                  {!column.doneColumn && (
                    <>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleDeleteColumn}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Column
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-2 space-y-2 min-h-[60px] overflow-y-auto">
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} boardId={boardId} onClick={() => onCardClick(task)} />
          ))}
      </div>

      <div className="px-2 pb-2">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg py-2 transition-colors"
          >
            + Add Task
          </button>
        ) : (
          <div className="space-y-1.5">
            <input
              className="input-field text-sm"
              placeholder="Task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
              autoFocus
            />
            <div className="flex gap-1.5">
              <button
                onClick={handleCreateTask}
                disabled={creating}
                className="btn-primary text-xs flex-1"
              >
                {creating ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={() => { setShowForm(false); setTaskTitle(''); }}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
