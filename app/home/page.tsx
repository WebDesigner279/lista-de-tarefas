"use client";

import { useCallback } from "react";
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
  "fixed inset-0 flex items-center justify-center p-3";
const PAGE_CONTENT_WIDTH_CLASS_NAME =
  "w-full max-w-[30.625rem] sm:max-w-[30rem] md:max-w-[40rem] lg:max-w-3xl";
const TASK_CARD_CLASS_NAME =
  "w-full max-h-[calc(100dvh-1.5rem)] overflow-hidden p-4";

const HomePage = () => {
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
  } = useTasks();

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
    <main className="relative w-full min-h-screen bg-gray-100">
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

export default HomePage;
