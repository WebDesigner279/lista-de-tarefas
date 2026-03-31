"use server";

import { clearCompletedTasks } from "@/features/tasks/service";

export const clearCompletedTasksAction = async () => {
  return clearCompletedTasks();
};
