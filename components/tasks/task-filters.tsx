"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TaskFilter } from "@/features/tasks/types";

interface TaskFiltersProps {
  activeFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

const FILTER_OPTIONS = [
  {
    value: "all",
    label: "Todos",
  },
  {
    value: "open",
    label: "Não finalizadas",
  },
  {
    value: "done",
    label: "Concluídas",
  },
] as const satisfies ReadonlyArray<{
  value: TaskFilter;
  label: string;
}>;

export const TaskFilters = memo(
  ({ activeFilter, onFilterChange }: TaskFiltersProps) => {
    return (
      <div className="flex flex-wrap gap-2 pt-1">
        {FILTER_OPTIONS.map(({ value, label }) => {
          const isActive = activeFilter === value;

          return (
            <Button
              key={value}
              type="button"
              size="sm"
              variant="outline"
              className={cn(
                "h-9 cursor-pointer rounded-full border px-3.5 text-sm font-semibold transition-colors",
                isActive
                  ? "border-blue-400 bg-blue-500 text-white hover:bg-blue-500 hover:text-white"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50",
              )}
              onClick={() => onFilterChange(value)}
            >
              <span>{label}</span>
            </Button>
          );
        })}
      </div>
    );
  },
);

TaskFilters.displayName = "TaskFilters";
