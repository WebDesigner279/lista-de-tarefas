"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import EditTask from "@/components/edit-task";
import { TaskRecord } from "@/features/tasks/types";

const TASK_ROW_STYLES = {
  open: {
    backgrounds: ["bg-blue-50", "bg-blue-100"],
    marker: "bg-blue-300",
  },
  done: {
    backgrounds: ["bg-red-50", "bg-red-100"],
    marker: "bg-red-400",
  },
} as const;

const getTaskRowClasses = (task: TaskRecord, index: number) => {
  const taskStyle = task.done ? TASK_ROW_STYLES.done : TASK_ROW_STYLES.open;

  return {
    rowBackgroundClass:
      taskStyle.backgrounds[index % taskStyle.backgrounds.length],
    markerClass: taskStyle.marker,
    textClass: task.done ? "line-through text-gray-700" : "",
  };
};

interface TaskListProps {
  tasks: TaskRecord[];
  onToggleTaskStatus: (taskId: string) => void;
  onSaveTask: (taskId: string, taskName: string) => Promise<boolean> | boolean;
  onDeleteTask: (taskId: string, taskName: string) => void;
}

interface TaskRowProps {
  task: TaskRecord;
  index: number;
  onToggleTaskStatus: (taskId: string) => void;
  onOpenEdit: (taskId: string) => void;
  onDeleteTask: (taskId: string, taskName: string) => void;
}

const TaskRow = memo(
  ({
    task,
    index,
    onToggleTaskStatus,
    onOpenEdit,
    onDeleteTask,
  }: TaskRowProps) => {
    const { rowBackgroundClass, markerClass, textClass } = getTaskRowClasses(
      task,
      index,
    );

    return (
      <div
        className={`${rowBackgroundClass} h-10 flex justify-between items-center`}
      >
        <div className={`w-2 h-full ${markerClass}`}></div>

        <button
          type="button"
          className={`flex-1 px-2 text-sm text-left cursor-pointer ${textClass}`}
          onClick={() => onToggleTaskStatus(task.id)}
        >
          {task.task}
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label={`Editar ${task.task}`}
            onClick={() => onOpenEdit(task.id)}
          >
            <SquarePen size={16} className="cursor-pointer text-blue-500" />
          </button>
          <Trash2
            size={16.5}
            className="cursor-pointer text-red-500 mr-2"
            onClick={() => onDeleteTask(task.id, task.task)}
          />
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
    const taskBeingEdited = useMemo(() => {
      if (!taskBeingEditedId) {
        return null;
      }

      return tasks.find((task) => task.id === taskBeingEditedId) ?? null;
    }, [taskBeingEditedId, tasks]);
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
          {tasks.map((task, index) => {
            return (
              <TaskRow
                key={task.id}
                task={task}
                index={index}
                onToggleTaskStatus={onToggleTaskStatus}
                onOpenEdit={handleOpenEdit}
                onDeleteTask={onDeleteTask}
              />
            );
          })}
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
