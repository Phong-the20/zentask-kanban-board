import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Task } from '../../types';
import { useDeleteTask } from '../../hooks/useTask';
import PriorityBadge from './PriorityBadge';

interface Props {
  task: Task;
  boardId: number;
  onClick?: () => void;
}

export default function KanbanCard({ task, boardId, onClick }: Props) {
  const [deleting, setDeleting] = useState(false);
  const deleteMutation = useDeleteTask(boardId);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `task-${task.id}`, data: { task } });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const deadline = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadline && deadline < new Date();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleting) return;
    setDeleting(true);
    deleteMutation.mutate(task.id, {
      onSettled: () => setDeleting(false),
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    e.stopPropagation();
    onClick?.();
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={handleClick}
      className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm 
        hover:shadow-md hover:border-primary-300 transition-all cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 shadow-lg z-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
          {task.title}
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Delete task"
        >
          {deleting ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <PriorityBadge priority={task.priority} />
        {deadline && (
          <span
            className={`text-[11px] font-medium ${
              isOverdue ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {isOverdue ? 'Overdue: ' : ''}
            {deadline.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        )}
      </div>

      {task.assigneeName && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="w-5 h-5 bg-primary-200 text-primary-700 rounded-full flex items-center justify-center text-[10px] font-bold">
            {task.assigneeName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500 truncate">{task.assigneeName}</span>
        </div>
      )}
    </div>
  );
}
