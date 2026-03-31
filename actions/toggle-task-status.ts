"use server";

import { toggleTaskDoneStatus } from "@/features/tasks/service";

export const toggleTaskStatus = async (idTask: string) => {
  return toggleTaskDoneStatus(idTask);
};
