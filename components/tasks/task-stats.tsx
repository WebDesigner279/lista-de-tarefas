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
  onClearCompletedTasks: () => void;
}

const getFilterSummaryLabel = (
  activeFilter: TaskFilter,
  totalTasks: number,
  openTasks: number,
  completedTasks: number,
) => {
  if (activeFilter === "open") {
    return `Não finalizadas ${openTasks} / ${totalTasks}`;
  }

  if (activeFilter === "done") {
    return `Concluídas ${completedTasks} / ${totalTasks}`;
  }

  return `Todos ${totalTasks} / ${totalTasks}`;
};

export const TaskStats = memo(
  ({
    activeFilter,
    totalTasks,
    openTasks,
    completedTasks,
    completionPercentage,
    onClearCompletedTasks,
  }: TaskStatsProps) => {
    const filterSummaryLabel = getFilterSummaryLabel(
      activeFilter,
      totalTasks,
      openTasks,
      completedTasks,
    );

    return (
      <>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-2 text-sm text-slate-700">
            <ListCheck className="size-4 text-blue-500" />
            <p className="truncate">{filterSummaryLabel}</p>
          </div>

          <Button
            className="shrink-0 cursor-pointer rounded-full px-3 text-red-500"
            variant="outline"
            size="sm"
            onClick={onClearCompletedTasks}
            disabled={completedTasks === 0}
          >
            <Trash2 className="size-4" />
            Limpar concluídas
          </Button>
        </div>

        <div className="mt-4 h-2.5 w-full rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-[width] duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 text-sm text-slate-700">
          <SquareSigma className="size-4" />
          <p>{totalTasks} tarefas no total</p>
        </div>
      </>
    );
  },
);

TaskStats.displayName = "TaskStats";
