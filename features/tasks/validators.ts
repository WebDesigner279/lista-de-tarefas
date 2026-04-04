import { MAX_TASK_LENGTH } from "@/features/tasks/constants";
import { TaskError, TaskErrorCode } from "@/features/tasks/errors";

export const normalizeTaskName = (taskName: string) => taskName.trim();

export const createTaskLookupKey = (taskName: string) =>
  normalizeTaskName(taskName).toLocaleLowerCase("pt-BR");

export const splitTaskNames = (taskNameInput: string) => {
  return taskNameInput.split(",").map(normalizeTaskName).filter(Boolean);
};

export const validateTaskName = (taskName: string) => {
  const normalizedTask = normalizeTaskName(taskName);

  if (!normalizedTask) {
    throw new TaskError(TaskErrorCode.NameRequired);
  }

  if (normalizedTask.length > MAX_TASK_LENGTH) {
    throw new TaskError(TaskErrorCode.NameTooLong);
  }

  return normalizedTask;
};
