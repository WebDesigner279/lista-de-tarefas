"use server";

import {
  clearCompletedTasks,
  createTasks,
  getAllTasks,
  removeTask,
  toggleTaskDoneStatus,
  updateTaskName,
} from "@/features/tasks/service";

export const fetchTasksAction = async () => {
  return getAllTasks();
};

export const createTasksAction = async (taskNameInput: string) => {
  return createTasks(taskNameInput);
};

export const deleteTaskAction = async (id: string, taskName?: string) => {
  return removeTask(id, taskName);
};

export const toggleTaskDoneStatusAction = async (taskId: string) => {
  return toggleTaskDoneStatus(taskId);
};

export const updateTaskNameAction = async (id: string, taskName: string) => {
  return updateTaskName(id, taskName);
};

export const clearCompletedTasksAction = async () => {
  return clearCompletedTasks();
};
