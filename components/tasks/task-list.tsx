"use client";

import { memo } from "react";
import { Tasks } from "@prisma/client";
import { Trash2 } from "lucide-react";
import EditTask from "@/components/edit-task";

const OPEN_TASK_ROW_BACKGROUNDS = ["bg-blue-50", "bg-blue-100"];

const DONE_TASK_ROW_BACKGROUNDS = ["bg-red-50", "bg-red-100"];

interface TaskListProps {
  tasks: Tasks[];
  onToggle: (id: string) => void;
  onEdit: (id: string, taskName: string) => Promise<boolean> | boolean;
  onDelete: (id: string, taskName: string) => void;
}

export const TaskList = memo(
  ({ tasks, onToggle, onEdit, onDelete }: TaskListProps) => {
    return (
      <div className="mt-2 h-80 overflow-y-auto pr-1">
        {tasks.map((task, index) => {
          const rowBackgroundClass = task.done
            ? DONE_TASK_ROW_BACKGROUNDS[
                index % DONE_TASK_ROW_BACKGROUNDS.length
              ]
            : OPEN_TASK_ROW_BACKGROUNDS[
                index % OPEN_TASK_ROW_BACKGROUNDS.length
              ];
          const markerClass = task.done ? "bg-red-400" : "bg-blue-300";

          return (
            <div
              className={`${rowBackgroundClass} h-10 flex justify-between items-center`}
              key={task.id}
            >
              <div className={`w-2 h-full ${markerClass}`}></div>

              <button
                type="button"
                className={`flex-1 px-2 text-sm text-left cursor-pointer ${task.done ? "line-through text-gray-700" : ""}`}
                onClick={() => onToggle(task.id)}
              >
                {task.task}
              </button>

              <div className="flex items-center gap-4">
                <EditTask
                  taskId={task.id}
                  taskName={task.task}
                  onSubmit={onEdit}
                />
                <Trash2
                  size={16.5}
                  className="cursor-pointer text-red-500 mr-2"
                  onClick={() => onDelete(task.id, task.task)}
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
