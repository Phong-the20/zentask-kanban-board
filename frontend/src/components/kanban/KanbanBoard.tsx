import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import type { TaskColumn, Task } from '../../types';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import TaskModal from './TaskModal';
import { useWebSocket } from '../../hooks/useWebSocket';
import api, { getToken } from '../../api/client';

interface Props {
  boardId: number;
  columns: TaskColumn[];
  initialTasks: Record<number, Task[]>;
  onTaskCreated: () => void;
}

export default function KanbanBoard({ boardId, columns, initialTasks, onTaskCreated }: Props) {
  const queryClient = useQueryClient();
  const [tasksByColumn, setTasksByColumn] = useState<Record<number, Task[]>>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const tasksByColumnRef = useRef(tasksByColumn);
  tasksByColumnRef.current = tasksByColumn;

  useEffect(() => {
    setTasksByColumn(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleBoardUpdate = useCallback(
    (message: any) => {
      if (message.type === 'TASK_MOVED') {
        const { taskId, targetColumnId } = message.data;

        queryClient.setQueryData<Task[]>(['board-tasks', boardId], (old) => {
          if (!old) return old;
          return old.map((t) =>
            t.id === taskId ? { ...t, columnId: targetColumnId } : t
          );
        });

        setTasksByColumn((prev) => {
          const updated: Record<number, Task[]> = {};
          let movedTask: Task | undefined;
          for (const colId of Object.keys(prev)) {
            const numericColId = Number(colId);
            const arr = prev[numericColId];
            const idx = arr.findIndex((t) => t.id === taskId);
            if (idx !== -1 && !movedTask) {
              movedTask = arr[idx];
              updated[numericColId] = arr.filter((_, i) => i !== idx);
            } else {
              updated[numericColId] = arr;
            }
          }
          if (movedTask) {
            updated[targetColumnId] = [
              ...(updated[targetColumnId] || prev[targetColumnId] || []),
              movedTask,
            ];
          }
          return updated;
        });
      } else if (message.type === 'TASK_UPDATED') {
        const { taskId, title, description, priority, deadline, assigneeId } = message.data;

        queryClient.setQueryData<Task[]>(['board-tasks', boardId], (old) => {
          if (!old) return old;
          return old.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              title: title ?? t.title,
              description: description ?? t.description,
              priority: priority ?? t.priority,
              deadline: deadline ?? t.deadline,
              assigneeId: assigneeId ?? t.assigneeId,
            };
          });
        });

        setTasksByColumn((prev) => {
          const updated: Record<number, Task[]> = {};
          let found = false;
          for (const colId of Object.keys(prev)) {
            const numericColId = Number(colId);
            const arr = prev[numericColId];
            if (!found) {
              const idx = arr.findIndex((t) => t.id === taskId);
              if (idx !== -1) {
                found = true;
                updated[numericColId] = arr.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        title: title ?? t.title,
                        description: description ?? t.description,
                        priority: priority ?? t.priority,
                        deadline: deadline ?? t.deadline,
                        assigneeId: assigneeId ?? t.assigneeId,
                      }
                    : t
                );
              } else {
                updated[numericColId] = arr;
              }
            } else {
              updated[numericColId] = arr;
            }
          }
          return updated;
        });
      }
    },
    [boardId, queryClient]
  );

  const { sendMessage } = useWebSocket({ boardId, onBoardUpdate: handleBoardUpdate });

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = event.active.data.current?.task as Task | undefined;
      if (task) setActiveTask(task);
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);

      const { active, over } = event;
      if (!over) return;

      const taskId = Number(active.id.toString().replace('task-', ''));
      const overId = over.id.toString();
      const sourceColumnId = active.data.current?.task?.columnId as number | undefined;
      if (sourceColumnId == null) return;

      // Determine the target column from the over target.
      // over.id can be a Column ID ("col-{id}") or a Task ID ("task-{id}").
      let targetColumnId: number | null = null;

      if (overId.startsWith('col-')) {
        targetColumnId = Number(overId.replace('col-', ''));
      } else if (overId.startsWith('task-')) {
        const overTaskId = Number(overId.replace('task-', ''));
        // Use ref to avoid stale closure (tasksByColumn changes on every state update)
        const latest = tasksByColumnRef.current;
        for (const [, tasks] of Object.entries(latest)) {
          const found = tasks.find((t) => t.id === overTaskId);
          if (found) {
            targetColumnId = found.columnId;
            break;
          }
        }
      }

      if (targetColumnId == null || targetColumnId === sourceColumnId) return;

      // Local state – remove from source, append to end of target
      setTasksByColumn((prev) => {
        const sourceArr = prev[sourceColumnId];
        if (!sourceArr) return prev;
        const idx = sourceArr.findIndex((t) => t.id === taskId);
        if (idx === -1) return prev;
        const movedTask = { ...sourceArr[idx], columnId: targetColumnId! };

        const updated = { ...prev };
        updated[sourceColumnId] = sourceArr.filter((_, i) => i !== idx);
        updated[targetColumnId!] = [...(updated[targetColumnId!] || []), movedTask];
        return updated;
      });

      // Sync React Query cache so the board re-renders correctly
      queryClient.setQueryData<Task[]>(['board-tasks', boardId], (old) => {
        if (!old) return old;
        return old.map((t) =>
          t.id === taskId ? { ...t, columnId: targetColumnId! } : t
        );
      });

      sendMessage('/board/move-task', {
        taskId,
        targetColumnId,
        newPosition: 0,
        boardId,
      });
    },
    [boardId, queryClient, sendMessage]
  );

  const handleTaskSave = useCallback(
    async (data: {
      taskId: number;
      description: string | null;
      deadline: string | null;
      priority: string;
      assigneeId: number | null;
    }) => {
      setSelectedTask(null);
      try {
        const token = getToken();

        await api.put(`/tasks/${data.taskId}`, {
          description: data.description,
          deadline: data.deadline,
          priority: data.priority,
          assigneeId: data.assigneeId,
        }, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        queryClient.invalidateQueries({ queryKey: ['board-tasks', boardId] });

        sendMessage('/board/update-task', {
          taskId: data.taskId,
          boardId,
          description: data.description,
          deadline: data.deadline,
          priority: data.priority,
          assigneeId: data.assigneeId,
        });
      } catch {
        alert('Failed to update task');
      }
    },
    [boardId, queryClient, sendMessage]
  );

  const columnList = useMemo(
    () => [...columns].sort((a, b) => a.positionIndex - b.positionIndex),
    [columns]
  );

  const handleCardClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full overflow-x-auto px-4 pb-4 pt-3">
          {columnList.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={tasksByColumn[col.id] || []}
              boardId={boardId}
              onTaskCreated={onTaskCreated}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-72 opacity-90">
              <KanbanCard task={activeTask} boardId={boardId} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          boardId={boardId}
          onClose={() => setSelectedTask(null)}
          onSave={handleTaskSave}
        />
      )}
    </>
  );
}
