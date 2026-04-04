"use client";

import { memo } from "react";
import { List, Check, CircleStop } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskFilter } from "@/features/tasks/types";

interface TaskFiltersProps {
  activeFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

const FILTER_OPTIONS = [
  {
    value: "all",
    label: "Todos",
    icon: List,
  },
  {
    value: "open",
    label: "Nao finalizadas",
    icon: CircleStop,
  },
  {
    value: "done",
    label: "Concluidas",
    icon: Check,
  },
] as const satisfies ReadonlyArray<{
  value: TaskFilter;
  label: string;
  icon: typeof List;
}>;

export const TaskFilters = memo(
  ({ activeFilter, onFilterChange }: TaskFiltersProps) => {
    return (
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map(({ value, label, icon: Icon }) => (
          <Badge
            key={value}
            className="cursor-pointer"
            variant={activeFilter === value ? "default" : "outline"}
            onClick={() => onFilterChange(value)}
          >
            <Icon />
            {label}
          </Badge>
        ))}
      </div>
    );
  },
);

TaskFilters.displayName = "TaskFilters";
