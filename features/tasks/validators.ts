import { MAX_TASK_LENGTH } from "@/features/tasks/constants";

export const normalizeTaskName = (taskName: string) => taskName.trim();

export const splitTaskNames = (taskNameInput: string) => {
  return taskNameInput.split(",").map(normalizeTaskName).filter(Boolean);
};

export const validateTaskName = (taskName: string) => {
  const normalizedTask = normalizeTaskName(taskName);

  if (!normalizedTask) {
    throw new Error("TASK_NAME_REQUIRED");
  }

  if (normalizedTask.length > MAX_TASK_LENGTH) {
    throw new Error("TASK_NAME_TOO_LONG");
  }

  return normalizedTask;
};
