"use client";

import { Tasks } from "@prisma/client";
import { Trash2 } from "lucide-react";
import EditTask from "@/components/edit-task";

const TASK_ROW_BACKGROUNDS = [
  "bg-blue-50",
  "bg-blue-80",
  "bg-blue-50",
  "bg-blue-80",
];

interface TaskListProps {
  tasks: Tasks[];
  onToggle: (id: string) => void;
  onDelete: (id: string, taskName: string) => void;
}

export const TaskList = ({ tasks, onToggle, onDelete }: TaskListProps) => {
  return (
    <div
      className={`mt-2 ${tasks.length >= 10 ? "max-h-96 overflow-y-auto" : ""}`}
    >
      {tasks.map((task, index) => (
        <div
          className={`${TASK_ROW_BACKGROUNDS[index % TASK_ROW_BACKGROUNDS.length]} h-10 flex justify-between items-center`}
          key={task.id}
        >
          <div className="w-2 h-full bg-blue-300"></div>

          <button
            type="button"
            className={`flex-1 px-2 text-sm text-left cursor-pointer ${task.done ? "line-through text-gray-500" : ""}`}
            onClick={() => onToggle(task.id)}
          >
            {task.task}
          </button>

          <div className="flex items-center gap-4">
            <EditTask />
            <Trash2
              size={16.5}
              className="cursor-pointer text-red-500 mr-2"
              onClick={() => onDelete(task.id, task.task)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
