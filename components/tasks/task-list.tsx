"use client";

import { memo } from "react";
import { Trash2 } from "lucide-react";
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

export const TaskList = memo(
  ({ tasks, onToggleTaskStatus, onSaveTask, onDeleteTask }: TaskListProps) => {
    return (
      <div className="mt-2 h-80 overflow-y-auto pr-1">
        {tasks.map((task, index) => {
          const { rowBackgroundClass, markerClass, textClass } =
            getTaskRowClasses(task, index);

          return (
            <div
              className={`${rowBackgroundClass} h-10 flex justify-between items-center`}
              key={task.id}
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
                <EditTask
                  taskId={task.id}
                  taskName={task.task}
                  onSaveTask={onSaveTask}
                />
                <Trash2
                  size={16.5}
                  className="cursor-pointer text-red-500 mr-2"
                  onClick={() => onDeleteTask(task.id, task.task)}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

TaskList.displayName = "TaskList";
