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

const Home = () => {
  const {
    activeFilter,
    setActiveFilter,
    totalTasks,
    completedTasks,
    openTasks,
    completionPercentage,
    filteredTasks,
    createTask,
    deleteTask,
    toggleTaskDone,
    clearCompleted,
  } = useTasks();

  const handleAddTask = useCallback(
    async (taskName: string) => createTask(taskName),
    [createTask],
  );

  return (
    <main className="relative w-full min-h-screen bg-gray-100">
      <div className="fixed inset-0 flex items-center justify-center p-3">
        <div className="w-full max-w-122.5 sm:max-w-120 md:max-w-160 lg:max-w-3xl">
          <Card className="w-full max-h-[calc(100dvh-1.5rem)] overflow-hidden p-4">
            <TaskInput onSubmit={handleAddTask} />

            <Separator />

            <TaskFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            <TaskList
              tasks={filteredTasks}
              onToggle={toggleTaskDone}
              onDelete={deleteTask}
            />

            <TaskStats
              activeFilter={activeFilter}
              totalTasks={totalTasks}
              openTasks={openTasks}
              completedTasks={completedTasks}
              completionPercentage={completionPercentage}
              onClearCompleted={() => {
                void clearCompleted();
              }}
            />
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Home;
