import { Tasks } from "@prisma/client";

export type TaskRecord = Tasks;

export type TaskFilter = "all" | "open" | "done";

export interface CreateTaskBatchResult {
  createdTasks: TaskRecord[];
  duplicateTasks: string[];
  invalidTasks: string[];
}
