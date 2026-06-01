import { useState, useEffect, useRef, type FormEvent } from 'react';
import type { Task, Priority } from '../../types';
import { useBoard } from '../../hooks/useBoard';
import { useWorkspaceMembers } from '../../hooks/useWorkspace';
import { useTaskComments } from '../../hooks/useTaskComments';
import { useTaskAttachments } from '../../hooks/useTaskAttachments';
import api from '../../api/client';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  task: Task;
  boardId: number;
  onClose: () => void;
  onSave: (data: {
    taskId: number;
    description: string | null;
    deadline: string | null;
    priority: string;
    assigneeId: number | null;
  }) => void;
}

const priorityOptions: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.max(0, now - date);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function TaskModal({ task, boardId, onClose, onSave }: Props) {
  const [description, setDescription] = useState(task.description ?? '');
  const [deadline, setDeadline] = useState(
    task.deadline ? task.deadline.slice(0, 10) : ''
  );
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [assigneeId, setAssigneeId] = useState<number | null>(task.assigneeId);
  const [saving, setSaving] = useState(false);
  const [newComment, setNewComment] = useState('');

  const { data: board } = useBoard(boardId);
  const workspaceId = board?.workspaceId ?? null;
  const { data: members } = useWorkspaceMembers(workspaceId);
  const { data: comments, isLoading: commentsLoading, addComment } = useTaskComments(task.id);
  const { data: attachments, upload: uploadAttach, remove: deleteAttach } = useTaskAttachments(task.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = useAuthStore((s) => s.user);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDescription(task.description ?? '');
    setDeadline(task.deadline ? task.deadline.slice(0, 10) : '');
    setPriority(task.priority);
    setAssigneeId(task.assigneeId);
  }, [task]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formattedDeadline = deadline
      ? deadline.length === 10
        ? deadline + 'T00:00:00'
        : deadline
      : null;
    onSave({
      taskId: task.id,
      description: description || null,
      deadline: formattedDeadline,
      priority,
      assigneeId,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAttach.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    addComment(newComment);
    setNewComment('');
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendComment();
    }
  };

  const handleDownload = async (attachmentId: number, fileName: string) => {
    console.log('Initiating download for ID:', attachmentId);
    try {
      const response = await api.get(`/attachments/${attachmentId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed! Check F12 Console. If 500/404, the backend could not find the file path.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {task.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="input-field min-h-[80px] resize-y"
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  className="input-field"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                >
                  {priorityOptions.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                className="input-field"
                value={assigneeId ?? ''}
                onChange={(e) =>
                  setAssigneeId(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">Unassigned</option>
                {members?.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          <div className="border-t border-gray-200 px-6 py-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Attachments {attachments && attachments.length > 0 ? `(${attachments.length})` : ''}
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAttach.isPending}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors disabled:opacity-50"
            >
              {uploadAttach.isPending ? 'Uploading...' : '+ Upload File'}
            </button>

            {Array.isArray(attachments) && attachments.length > 0 && (
              <ul className="mt-3 space-y-2">
                {attachments.map((att) => (
                  <li key={att.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg text-sm">
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="flex-1 truncate min-w-0">{att.fileName}</span>
                    <span className="text-xs text-gray-400 shrink-0">{formatBytes(att.fileSize)}</span>
                    <button
                      type="button"
                      onClick={() => handleDownload(att.id, att.fileName)}
                      className="p-1 text-gray-400 hover:text-indigo-600 transition shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAttach.mutate(att.id)}
                      disabled={deleteAttach.isPending}
                      className="p-1 text-gray-400 hover:text-red-600 transition shrink-0 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-200 px-6 py-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Comments {comments ? `(${comments.length})` : ''}
            </h3>

            <div className="space-y-4 max-h-56 overflow-y-auto mb-4">
              {commentsLoading && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Loading comments...
                </p>
              )}
              {!commentsLoading && (!comments || comments.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No comments yet.
                </p>
              )}
              {comments?.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium shrink-0">
                    {c.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {c.userName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap break-words">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={listEndRef} />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-medium shrink-0">
                {(currentUser?.fullName ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleCommentKeyDown}
                />
                <button
                  type="button"
                  onClick={handleSendComment}
                  disabled={!newComment.trim()}
                  className="btn-primary text-sm whitespace-nowrap px-4"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
