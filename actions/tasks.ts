"use server";

import { requireAuthenticatedUser } from "@/lib/auth";
import {
  clearCompletedTasks,
  createTasks,
  getAllTasks,
  removeTask,
  toggleTaskDoneStatus,
  updateTaskName,
} from "@/features/tasks/service";

export const fetchTasksAction = async () => {
  const user = await requireAuthenticatedUser();

  return getAllTasks(user.id);
};

export const createTasksAction = async (taskNameInput: string) => {
  const user = await requireAuthenticatedUser();

  return createTasks(user.id, taskNameInput);
};

export const deleteTaskAction = async (id: string, taskName?: string) => {
  const user = await requireAuthenticatedUser();

  return removeTask(user.id, id, taskName);
};

export const toggleTaskDoneStatusAction = async (taskId: string) => {
  const user = await requireAuthenticatedUser();

  return toggleTaskDoneStatus(user.id, taskId);
};

export const updateTaskNameAction = async (id: string, taskName: string) => {
  const user = await requireAuthenticatedUser();

  return updateTaskName(user.id, id, taskName);
};

export const clearCompletedTasksAction = async () => {
  const user = await requireAuthenticatedUser();

  return clearCompletedTasks(user.id);
};
