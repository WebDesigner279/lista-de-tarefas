"use server";

import { createTasks } from "@/features/tasks/service";

export const createTaskAction = async (taskNameInput: string) => {
  return createTasks(taskNameInput);
};
