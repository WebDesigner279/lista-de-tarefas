"use server";

import { updateTaskName } from "@/features/tasks/service";

export const updateTaskAction = async (id: string, taskName: string) => {
  return updateTaskName(id, taskName);
};
