export interface TaskRecord {
  id: string;
  task: string;
  done: boolean;
}

export type TaskFilter = "all" | "open" | "done";

export interface CreateTaskBatchResult {
  createdTasks: TaskRecord[];
  duplicateTasks: string[];
  invalidTasks: string[];
}
