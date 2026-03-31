"use server";

import { getAllTasks } from "@/features/tasks/service";

export const getTasks = async () => {
  return getAllTasks();
};
