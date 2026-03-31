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
} from "@/features/tasks/repository";
import {
  normalizeTaskName,
  validateTaskName,
} from "@/features/tasks/validators";

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

export const clearCompletedTasks = async () => {
  const result = await deleteCompletedTasks();

  if (result.count > 0) {
    publishTaskUpdate();
  }

  return result.count;
};
