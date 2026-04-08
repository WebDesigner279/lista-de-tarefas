"use client";

import { useCallback } from "react";
import { TaskRecord } from "@/features/tasks/types";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  TaskInput,
  TaskFilters,
  TaskList,
  TaskStats,
} from "@/components/tasks";
import { useTasks } from "@/features/tasks/hooks";

const PAGE_SHELL_CLASS_NAME =
  "mx-auto flex w-full max-w-6xl justify-center px-3 py-6 sm:px-4 sm:py-8";
const PAGE_CONTENT_WIDTH_CLASS_NAME = "w-full max-w-4xl";
const TASK_CARD_CLASS_NAME =
  "w-full overflow-hidden border-white/80 bg-white/90 p-4 shadow-2xl shadow-slate-200/60 backdrop-blur sm:p-5";

interface HomeClientPageProps {
  initialTasks: TaskRecord[];
}

const HomeClientPage = ({ initialTasks }: HomeClientPageProps) => {
  const {
    activeFilter,
    setActiveFilter,
    totalTasks,
    completedTasks,
    openTasks,
    completionPercentage,
    filteredTasks,
    createTask,
    editTask,
    deleteTask,
    toggleTaskDone,
    clearCompleted,
  } = useTasks({ initialTasks });

  const handleCreateTask = useCallback(
    async (taskName: string) => createTask(taskName),
    [createTask],
  );

  const handleSaveTask = useCallback(
    async (id: string, taskName: string) => editTask(id, taskName),
    [editTask],
  );

  const handleClearCompletedTasks = useCallback(() => {
    void clearCompleted();
  }, [clearCompleted]);

  return (
    <main className="relative w-full">
      <div className={PAGE_SHELL_CLASS_NAME}>
        <div className={PAGE_CONTENT_WIDTH_CLASS_NAME}>
          <Card className={TASK_CARD_CLASS_NAME}>
            <TaskInput onCreateTask={handleCreateTask} />

            <Separator />

            <TaskFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            <TaskList
              tasks={filteredTasks}
              onToggleTaskStatus={toggleTaskDone}
              onSaveTask={handleSaveTask}
              onDeleteTask={deleteTask}
            />

            <TaskStats
              activeFilter={activeFilter}
              totalTasks={totalTasks}
              openTasks={openTasks}
              completedTasks={completedTasks}
              completionPercentage={completionPercentage}
              onClearCompletedTasks={handleClearCompletedTasks}
            />
          </Card>
        </div>
      </div>
    </main>
  );
};

export default HomeClientPage;
