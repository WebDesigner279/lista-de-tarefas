import { TaskFilter } from "@/features/tasks/types";
import { createTaskLookupKey } from "@/features/tasks/validators";
import { TaskRecord } from "@/features/tasks/types";

const areTaskListsEqual = (
  currentTasks: TaskRecord[],
  nextTasks: TaskRecord[],
) => {
  return (
    createTaskListSignature(currentTasks) === createTaskListSignature(nextTasks)
  );
};

export const countCompletedTasks = (tasks: TaskRecord[]) => {
  return tasks.filter((task) => task.done).length;
};

export const calculateCompletionPercentage = (
  totalTasks: number,
  completedTasks: number,
) => {
  if (totalTasks === 0) {
    return 0;
  }

  return Math.round((completedTasks / totalTasks) * 100);
};

export const filterTasksByStatus = (
  tasks: TaskRecord[],
  activeFilter: TaskFilter,
) => {
  return tasks.filter((task) => {
    if (activeFilter === "done") {
      return task.done;
    }

    if (activeFilter === "open") {
      return !task.done;
    }

    return true;
  });
};

export const createTaskListSignature = (tasks: TaskRecord[]) => {
  return tasks.map((task) => `${task.id}:${task.task}:${task.done}`).join("|");
};

export const mergeTaskListSnapshot = (
  currentTasks: TaskRecord[],
  nextTasks: TaskRecord[],
) => {
  return areTaskListsEqual(currentTasks, nextTasks) ? currentTasks : nextTasks;
};

export const appendTasksToList = (
  currentTasks: TaskRecord[],
  createdTasks: TaskRecord[],
) => {
  return [...currentTasks, ...createdTasks];
};

export const removeTaskFromList = (
  currentTasks: TaskRecord[],
  removedTaskId: string,
  removedTaskName?: string,
) => {
  const removedTaskKey = createTaskLookupKey(removedTaskName ?? "");

  return currentTasks.filter((task) => {
    if (task.id === removedTaskId) {
      return false;
    }

    if (!removedTaskName) {
      return true;
    }

    return createTaskLookupKey(task.task) !== removedTaskKey;
  });
};

export const replaceTaskInList = (
  currentTasks: TaskRecord[],
  updatedTask: TaskRecord,
) => {
  return currentTasks.map((task) =>
    task.id === updatedTask.id ? updatedTask : task,
  );
};

export const removeCompletedTasksFromList = (currentTasks: TaskRecord[]) => {
  return currentTasks.filter((task) => !task.done);
};
