"use client";

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
    currentTaskInput,
    setCurrentTaskInput,
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
  } = useTasks();

  const handleAddTask = async () => {
    const success = await createTask(currentTaskInput);
    if (success) {
      setCurrentTaskInput("");
    }
  };

  return (
    <main className="w-full min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="w-full max-w-122.5 sm:max-w-120 md:max-w-160 lg:max-w-3xl px-3">
        <Card className="w-full p-4">
          <TaskInput
            value={currentTaskInput}
            onChange={setCurrentTaskInput}
            onSubmit={handleAddTask}
          />

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
          />
        </Card>
      </div>
    </main>
  );
};

export default Home;
