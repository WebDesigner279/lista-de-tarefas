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
  userId: string,
  taskName: string,
  currentTaskId?: string,
) => {
  const duplicatedTask = await findTaskByNameInsensitive(userId, taskName);

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
  userId: string,
  taskNames: string[],
  duplicateTasks: string[],
) => {
  const existingTasks = await findTasksByNamesInsensitive(userId, taskNames);
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
    taskNamesToCreate.map((taskName) => createTaskRecord(userId, taskName)),
  );
};

export const createTask = async (userId: string, taskName: string) => {
  const normalizedTaskName = validateTaskName(taskName);

  await ensureTaskDoesNotExist(userId, normalizedTaskName);

  return createTaskRecord(userId, normalizedTaskName);
};

export const createTasks = async (
  userId: string,
  taskNameInput: string,
): Promise<CreateTaskBatchResult> => {
  const { validTaskNames, duplicateTasks, invalidTasks } =
    collectTaskCreationCandidates(taskNameInput);

  const createdTasks = await createUniqueTasks(
    userId,
    validTaskNames,
    duplicateTasks,
  );

  return {
    createdTasks,
    duplicateTasks,
    invalidTasks,
  };
};

export const getAllTasks = (userId: string) => {
  return listTasks(userId);
};

export const removeTask = async (
  userId: string,
  id: string,
  taskName?: string,
) => {
  if (!id && !taskName) return false;

  if (id) {
    try {
      const result = await deleteTaskById(userId, id);
      if (result.count > 0) {
        return true;
      }
    } catch {
      // Fallback para o nome se o id nao existir mais.
    }
  }

  if (!taskName) return false;

  const normalizedTask = normalizeTaskName(taskName);
  if (!normalizedTask) return false;

  const result = await deleteTasksByNameInsensitive(userId, normalizedTask);
  if (result.count === 0) return false;

  return true;
};

export const toggleTaskDoneStatus = async (userId: string, id: string) => {
  if (!id) return null;

  const currentTask = await findTaskById(userId, id);
  if (!currentTask) return null;

  return updateTaskDoneStatus(id, !currentTask.done);
};

export const updateTaskName = async (
  userId: string,
  id: string,
  taskName: string,
) => {
  if (!id) {
    throw new TaskError(TaskErrorCode.TaskNotFound);
  }

  const currentTask = await findTaskById(userId, id);

  if (!currentTask) {
    throw new TaskError(TaskErrorCode.TaskNotFound);
  }

  const normalizedTask = validateTaskName(taskName);

  if (currentTask.task === normalizedTask) {
    return currentTask;
  }

  await ensureTaskDoesNotExist(userId, normalizedTask, id);

  return updateTaskNameById(id, normalizedTask);
};

export const clearCompletedTasks = async (userId: string) => {
  const result = await deleteCompletedTasks(userId);

  return result.count;
};
