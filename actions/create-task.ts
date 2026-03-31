"use server";

import { createTask } from "@/features/tasks/service";

export const createTaskAction = async (taskName: string) => {
  return createTask(taskName);
};
