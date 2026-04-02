import { Tasks } from "@prisma/client";

export type TaskFilter = "all" | "open" | "done";

export interface CreateTasksResult {
  createdTasks: Tasks[];
  duplicateTasks: string[];
  invalidTasks: string[];
}
