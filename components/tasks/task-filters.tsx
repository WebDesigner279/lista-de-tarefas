"use client";

import { Badge } from "@/components/ui/badge";
import { List, Check, CircleStop } from "lucide-react";
import { TaskFilter } from "@/features/tasks/types";

interface TaskFiltersProps {
  activeFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

export const TaskFilters = ({
  activeFilter,
  onFilterChange,
}: TaskFiltersProps) => {
  return (
    <div className="flex gap-2">
      <Badge
        className="cursor-pointer"
        variant={activeFilter === "all" ? "default" : "outline"}
        onClick={() => onFilterChange("all")}
      >
        <List />
        Todos
      </Badge>

      <Badge
        className="cursor-pointer"
        variant={activeFilter === "open" ? "default" : "outline"}
        onClick={() => onFilterChange("open")}
      >
        <CircleStop />
        Não finalizadas
      </Badge>

      <Badge
        className="cursor-pointer"
        variant={activeFilter === "done" ? "default" : "outline"}
        onClick={() => onFilterChange("done")}
      >
        <Check />
        Concluídas
      </Badge>
    </div>
  );
};
