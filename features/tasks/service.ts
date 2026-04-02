import { publishTaskUpdate } from "@/lib/task-events";
import {
  createTaskRecord,
  deleteCompletedTasks,
  deleteTaskById,
  deleteTasksByNameInsensitive,
  findTaskById,
  findTaskByNameInsensitive,
  listTasks,
  updateTaskDoneStatus,
  updateTaskNameById,
} from "@/features/tasks/repository";
import {
  normalizeTaskName,
  splitTaskNames,
  validateTaskName,
} from "@/features/tasks/validators";
import { CreateTasksResult } from "@/features/tasks/types";

export const createTask = async (taskName: string) => {
  const normalizedTask = validateTaskName(taskName);

  const duplicatedTask = await findTaskByNameInsensitive(normalizedTask);
  if (duplicatedTask) {
    throw new Error("DUPLICATE_TASK");
  }

  const newTask = await createTaskRecord(normalizedTask);
  publishTaskUpdate();

  return newTask;
};

export const createTasks = async (
  taskNameInput: string,
): Promise<CreateTasksResult> => {
  const parsedTasks = splitTaskNames(taskNameInput);

  if (parsedTasks.length === 0) {
    throw new Error("TASK_NAME_REQUIRED");
  }

  const seenTasks = new Set<string>();
  const uniqueTasks: string[] = [];
  const duplicateTasks: string[] = [];
  const invalidTasks: string[] = [];

  for (const rawTaskName of parsedTasks) {
    try {
      const normalizedTask = validateTaskName(rawTaskName);
      const taskKey = normalizedTask.toLocaleLowerCase("pt-BR");

      if (seenTasks.has(taskKey)) {
        duplicateTasks.push(normalizedTask);
        continue;
      }

      seenTasks.add(taskKey);
      uniqueTasks.push(normalizedTask);
    } catch (error) {
      if (error instanceof Error && error.message === "TASK_NAME_TOO_LONG") {
        invalidTasks.push(rawTaskName);
        continue;
      }

      throw error;
    }
  }

  const createdTasks = [];

  for (const taskName of uniqueTasks) {
    const duplicatedTask = await findTaskByNameInsensitive(taskName);

    if (duplicatedTask) {
      duplicateTasks.push(taskName);
      continue;
    }

    const newTask = await createTaskRecord(taskName);
    createdTasks.push(newTask);
  }

  if (createdTasks.length > 0) {
    publishTaskUpdate();
  }

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
      publishTaskUpdate();
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

  publishTaskUpdate();
  return true;
};

export const toggleTaskDoneStatus = async (id: string) => {
  if (!id) return null;

  const currentTask = await findTaskById(id);
  if (!currentTask) return null;

  const updatedTask = await updateTaskDoneStatus(id, !currentTask.done);
  publishTaskUpdate();

  return updatedTask;
};

export const updateTaskName = async (id: string, taskName: string) => {
  if (!id) {
    throw new Error("TASK_NOT_FOUND");
  }

  const currentTask = await findTaskById(id);

  if (!currentTask) {
    throw new Error("TASK_NOT_FOUND");
  }

  const normalizedTask = validateTaskName(taskName);

  if (currentTask.task === normalizedTask) {
    return currentTask;
  }

  const duplicatedTask = await findTaskByNameInsensitive(normalizedTask);

  if (duplicatedTask && duplicatedTask.id !== id) {
    throw new Error("DUPLICATE_TASK");
  }

  const updatedTask = await updateTaskNameById(id, normalizedTask);
  publishTaskUpdate();

  return updatedTask;
};

export const clearCompletedTasks = async () => {
  const result = await deleteCompletedTasks();

  if (result.count > 0) {
    publishTaskUpdate();
  }

  return result.count;
};
