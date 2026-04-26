"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { Check, Circle, SquarePen, Trash2 } from "lucide-react";
import EditTask from "@/components/edit-task";
import { cn } from "@/lib/utils";
import { TaskRecord } from "@/features/tasks/types";

const TASK_ROW_STYLES = {
  open: {
    container: "border-red-100 bg-rose-50/90",
    status:
      "border-red-500 bg-white text-red-500 hover:border-red-500 hover:bg-white hover:text-red-500",
    text: "text-slate-700",
  },
  done: {
    container: "border-blue-100 bg-blue-100/90",
    status:
      "border-blue-500 bg-blue-500 text-white hover:bg-blue-500 hover:text-white",
    text: "text-slate-700",
  },
} as const;

const getTaskRowClasses = (task: TaskRecord) => {
  const taskStyle = task.done ? TASK_ROW_STYLES.done : TASK_ROW_STYLES.open;

  return {
    rowClass: taskStyle.container,
    statusClass: taskStyle.status,
    textClass: taskStyle.text,
  };
};

const getTaskToggleLabel = (task: TaskRecord) => {
  return task.done
    ? `Marcar ${task.task} como não concluída`
    : `Marcar ${task.task} como concluída`;
};

interface TaskListProps {
  tasks: TaskRecord[];
  onToggleTaskStatus: (taskId: string) => void;
  onSaveTask: (taskId: string, taskName: string) => Promise<boolean> | boolean;
  onDeleteTask: (taskId: string, taskName: string) => void;
}

interface TaskRowProps {
  task: TaskRecord;
  onToggleTaskStatus: (taskId: string) => void;
  onOpenEdit: (taskId: string) => void;
  onDeleteTask: (taskId: string, taskName: string) => void;
}

const TaskRow = memo(
  ({
    task,
    onToggleTaskStatus,
    onOpenEdit,
    onDeleteTask,
  }: TaskRowProps) => {
    const { rowClass, statusClass, textClass } = getTaskRowClasses(task);
    const StatusIcon = task.done ? Check : Circle;

    return (
      <div
        data-task-row
        data-task-state={task.done ? "done" : "open"}
        className={cn(
          "grid grid-cols-[auto_minmax(0,1fr)_auto] items-stretch gap-2 rounded-[22px] border px-4 py-3 transition-colors sm:px-5",
          rowClass,
        )}
      >
        <button
          type="button"
          aria-label={getTaskToggleLabel(task)}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center self-center rounded-full border transition-transform active:scale-95",
            statusClass,
          )}
          onClick={() => onToggleTaskStatus(task.id)}
         >
          <StatusIcon className="size-4" />
        </button>

        <button
          type="button"
          className="block w-full self-stretch py-1 pr-2 text-left leading-5 sm:leading-6"
          onClick={() => onToggleTaskStatus(task.id)}
        >
          <span
            className={cn(
              "block max-w-full break-words text-[15px] font-medium sm:truncate",
              textClass,
            )}
          >
            {task.task}
          </span>
        </button>

        <div className="flex items-center gap-1 self-center">
          <button
            type="button"
            aria-label={`Editar ${task.task}`}
            className="flex size-8 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-white/70"
            onClick={() => onOpenEdit(task.id)}
          >
            <SquarePen className="size-4" />
          </button>
          <button
            type="button"
            aria-label={`Excluir ${task.task}`}
            className="flex size-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-white/70"
            onClick={() => onDeleteTask(task.id, task.task)}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    );
  },
);

TaskRow.displayName = "TaskRow";

export const TaskList = memo(
  ({ tasks, onToggleTaskStatus, onSaveTask, onDeleteTask }: TaskListProps) => {
    const [taskBeingEditedId, setTaskBeingEditedId] = useState<string | null>(
      null,
    );
    const orderedTasks = useMemo(() => {
      return [...tasks].sort((firstTask, secondTask) => {
        if (firstTask.done === secondTask.done) {
          return 0;
        }

        return firstTask.done ? -1 : 1;
      });
    }, [tasks]);
    const taskBeingEdited = useMemo(() => {
      if (!taskBeingEditedId) {
        return null;
      }

      return orderedTasks.find((task) => task.id === taskBeingEditedId) ?? null;
    }, [orderedTasks, taskBeingEditedId]);
    const handleOpenEdit = useCallback((taskId: string) => {
      setTaskBeingEditedId(taskId);
    }, []);
    const handleCloseEdit = useCallback((isOpen: boolean) => {
      if (!isOpen) {
        setTaskBeingEditedId(null);
      }
    }, []);

    return (
      <>
        <div className="mt-2 h-80 overflow-y-auto pr-1">
          <div className="space-y-2">
            {orderedTasks.map((task) => {
            return (
              <TaskRow
                key={task.id}
                task={task}
                onToggleTaskStatus={onToggleTaskStatus}
                onOpenEdit={handleOpenEdit}
                onDeleteTask={onDeleteTask}
              />
            );
            })}
          </div>
        </div>

        <EditTask
          taskId={taskBeingEdited?.id ?? null}
          taskName={taskBeingEdited?.task ?? ""}
          isDialogOpen={taskBeingEdited !== null}
          onOpenChange={handleCloseEdit}
          onSaveTask={onSaveTask}
        />
      </>
    );
  },
);

TaskList.displayName = "TaskList";
