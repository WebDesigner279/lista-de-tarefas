"use client";

import { memo } from "react";
import { ListCheck, SquareSigma, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskFilter } from "@/features/tasks/types";

interface TaskStatsProps {
  activeFilter: TaskFilter;
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
  completionPercentage: number;
  onClearCompleted: () => void;
}

export const TaskStats = memo(
  ({
    activeFilter,
    totalTasks,
    openTasks,
    completedTasks,
    completionPercentage,
    onClearCompleted,
  }: TaskStatsProps) => {
    return (
      <>
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2 items-center mt-2">
            <ListCheck size={16} className="text-blue-500 mb-2" />
            <p className="text-xs mb-2">
              {activeFilter === "open" &&
                `Não finalizadas ${openTasks} / ${totalTasks}`}
              {activeFilter === "done" &&
                `Concluídas ${completedTasks} / ${totalTasks}`}
              {activeFilter === "all" && `Todos ${totalTasks} / ${totalTasks}`}
            </p>
          </div>

          <Button
            className="text-red-500 w-38 h-7 cursor-pointer"
            variant="outline"
            onClick={onClearCompleted}
            disabled={completedTasks === 0}
          >
            <Trash2 size={16} />
            Limpar concluídas
          </Button>
        </div>

        <div className="h-2 w-full bg-gray-100 mt-4 rounded-md">
          <div
            className="h-full bg-blue-500 rounded-md"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="flex justify-end items-center mt-2 gap-2">
          <SquareSigma size={16} />
          <p className="text-xs">{totalTasks} tarefas no total</p>
        </div>
      </>
    );
  },
);

TaskStats.displayName = "TaskStats";
