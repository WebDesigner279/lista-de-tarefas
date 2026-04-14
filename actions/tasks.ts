"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser } from "@/lib/auth";
import {
  clearCompletedTasks,
  createTasks,
  getAllTasks,
  removeTask,
  toggleTaskDoneStatus,
  updateTaskName,
} from "@/features/tasks/service";

const revalidateTaskViews = () => {
  revalidatePath("/home");
  revalidatePath("/dashboard");
};

export const fetchTasksAction = async () => {
  const user = await requireAuthenticatedUser();

  return getAllTasks(user.id);
};

export const createTasksAction = async (taskNameInput: string) => {
  const user = await requireAuthenticatedUser();
  const result = await createTasks(user.id, taskNameInput);

  revalidateTaskViews();

  return result;
};

export const deleteTaskAction = async (id: string, taskName?: string) => {
  const user = await requireAuthenticatedUser();
  const result = await removeTask(user.id, id, taskName);

  revalidateTaskViews();

  return result;
};

export const toggleTaskDoneStatusAction = async (taskId: string) => {
  const user = await requireAuthenticatedUser();
  const result = await toggleTaskDoneStatus(user.id, taskId);

  revalidateTaskViews();

  return result;
};

export const updateTaskNameAction = async (id: string, taskName: string) => {
  const user = await requireAuthenticatedUser();
  const result = await updateTaskName(user.id, id, taskName);

  revalidateTaskViews();

  return result;
};

export const clearCompletedTasksAction = async () => {
  const user = await requireAuthenticatedUser();
  const result = await clearCompletedTasks(user.id);

  revalidateTaskViews();

  return result;
};
