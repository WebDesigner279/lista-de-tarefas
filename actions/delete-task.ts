"use server";

import { removeTask } from "@/features/tasks/service";

export const deleteTaskAction = async (id: string, taskName?: string) => {
  return removeTask(id, taskName);
};
