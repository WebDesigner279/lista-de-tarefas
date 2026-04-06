import {
  createTaskRecord,
  deleteCompletedTasks,
  deleteTaskById,
  deleteTasksByNameInsensitive,
  findTaskById,
  findTaskByNameInsensitive,
  findTasksByNamesInsensitive,
  listTasks,
  updateTaskDoneStatus,
  updateTaskNameById,
} from "@/features/tasks/repository";
import { TaskError, TaskErrorCode, isTaskError } from "@/features/tasks/errors";
import {
  createTaskLookupKey,
  normalizeTaskName,
  splitTaskNames,
  validateTaskName,
} from "@/features/tasks/validators";
import { CreateTaskBatchResult } from "@/features/tasks/types";

const ensureTaskDoesNotExist = async (
  taskName: string,
  currentTaskId?: string,
) => {
  const duplicatedTask = await findTaskByNameInsensitive(taskName);

  if (duplicatedTask && duplicatedTask.id !== currentTaskId) {
    throw new TaskError(TaskErrorCode.DuplicateTask);
  }
};

const collectTaskCreationCandidates = (taskNameInput: string) => {
  const parsedTaskNames = splitTaskNames(taskNameInput);

  if (parsedTaskNames.length === 0) {
    throw new TaskError(TaskErrorCode.NameRequired);
  }

  const seenTaskKeys = new Set<string>();
  const validTaskNames: string[] = [];
  const duplicateTasks: string[] = [];
  const invalidTasks: string[] = [];

  for (const rawTaskName of parsedTaskNames) {
    try {
      const normalizedTaskName = validateTaskName(rawTaskName);
      const taskLookupKey = createTaskLookupKey(normalizedTaskName);

      if (seenTaskKeys.has(taskLookupKey)) {
        duplicateTasks.push(normalizedTaskName);
        continue;
      }

      seenTaskKeys.add(taskLookupKey);
      validTaskNames.push(normalizedTaskName);
    } catch (error) {
      if (isTaskError(error, TaskErrorCode.NameTooLong)) {
        invalidTasks.push(rawTaskName);
        continue;
      }

      throw error;
    }
  }

  return {
    validTaskNames,
    duplicateTasks,
    invalidTasks,
  };
};

const createUniqueTasks = async (
  taskNames: string[],
  duplicateTasks: string[],
) => {
  const existingTasks = await findTasksByNamesInsensitive(taskNames);
  const existingTaskKeys = new Set(
    existingTasks.map((task) => createTaskLookupKey(task.task)),
  );
  const taskNamesToCreate = taskNames.filter((taskName) => {
    const taskLookupKey = createTaskLookupKey(taskName);

    if (existingTaskKeys.has(taskLookupKey)) {
      duplicateTasks.push(taskName);
      return false;
    }

    return true;
  });

  return Promise.all(
    taskNamesToCreate.map((taskName) => createTaskRecord(taskName)),
  );
};

export const createTask = async (taskName: string) => {
  const normalizedTaskName = validateTaskName(taskName);

  await ensureTaskDoesNotExist(normalizedTaskName);

  return createTaskRecord(normalizedTaskName);
};

export const createTasks = async (
  taskNameInput: string,
): Promise<CreateTaskBatchResult> => {
  const { validTaskNames, duplicateTasks, invalidTasks } =
    collectTaskCreationCandidates(taskNameInput);

  const createdTasks = await createUniqueTasks(validTaskNames, duplicateTasks);

  return {
    createdTasks,
    duplicateTasks,
    invalidTasks,
  };
};

export const getAllTasks = () => {
  return listTasks();
};

export const removeTask = async (id: string, taskName?: string) => {
  if (!id && !taskName) return false;

  if (id) {
    try {
      await deleteTaskById(id);
      return true;
    } catch {
      // Fallback para o nome se o id nao existir mais.
    }
  }

  if (!taskName) return false;

  const normalizedTask = normalizeTaskName(taskName);
  if (!normalizedTask) return false;

  const result = await deleteTasksByNameInsensitive(normalizedTask);
  if (result.count === 0) return false;

  return true;
};

export const toggleTaskDoneStatus = async (id: string) => {
  if (!id) return null;

  const currentTask = await findTaskById(id);
  if (!currentTask) return null;

  return updateTaskDoneStatus(id, !currentTask.done);
};

export const updateTaskName = async (id: string, taskName: string) => {
  if (!id) {
    throw new TaskError(TaskErrorCode.TaskNotFound);
  }

  const currentTask = await findTaskById(id);

  if (!currentTask) {
    throw new TaskError(TaskErrorCode.TaskNotFound);
  }

  const normalizedTask = validateTaskName(taskName);

  if (currentTask.task === normalizedTask) {
    return currentTask;
  }

  await ensureTaskDoesNotExist(normalizedTask, id);

  return updateTaskNameById(id, normalizedTask);
};

export const clearCompletedTasks = async () => {
  const result = await deleteCompletedTasks();

  return result.count;
};
