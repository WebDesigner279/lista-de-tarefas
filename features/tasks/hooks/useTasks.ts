"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearCompletedTasksAction,
  createTasksAction,
  deleteTaskAction,
  fetchTasksAction,
  toggleTaskDoneStatusAction,
  updateTaskNameAction,
} from "@/actions/tasks";
import { isTaskError, TaskErrorCode } from "@/features/tasks/errors";
import {
  appendTasksToList,
  calculateCompletionPercentage,
  countCompletedTasks,
  filterTasksByStatus,
  mergeTaskListSnapshot,
  removeCompletedTasksFromList,
  removeTaskFromList,
  replaceTaskInList,
} from "@/features/tasks/hooks/useTasks.helpers";
import { taskMessages } from "@/features/tasks/messages";
import { TaskFilter, TaskRecord } from "@/features/tasks/types";
import {
  createTaskLookupKey,
  splitTaskNames,
  validateTaskName,
} from "@/features/tasks/validators";
import { toast } from "sonner";

const TASK_SYNC_INTERVAL_IN_MS = 15000;

interface UseTasksOptions {
  initialTasks?: TaskRecord[];
}

const logTaskError = (message: string, error: unknown) => {
  console.error(message, error);
};

const createOptimisticTaskId = () => {
  if (typeof globalThis.crypto !== "undefined") {
    if (typeof globalThis.crypto.randomUUID === "function") {
      return `optimistic-${globalThis.crypto.randomUUID()}`;
    }

    if (typeof globalThis.crypto.getRandomValues === "function") {
      const randomValues = new Uint32Array(2);
      globalThis.crypto.getRandomValues(randomValues);

      return `optimistic-${randomValues[0]}-${randomValues[1]}`;
    }
  }

  return `optimistic-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const sortTasksByName = (tasks: TaskRecord[]) => {
  return [...tasks].sort((firstTask, secondTask) =>
    firstTask.task.localeCompare(secondTask.task, "pt-BR"),
  );
};

export const useTasks = ({ initialTasks }: UseTasksOptions = {}) => {
  const [taskList, setTaskList] = useState<TaskRecord[]>(initialTasks ?? []);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");
  const taskListRef = useRef(taskList);

  useEffect(() => {
    taskListRef.current = taskList;
  }, [taskList]);

  const totalTasks = useMemo(() => taskList.length, [taskList]);
  const completedTasks = useMemo(
    () => countCompletedTasks(taskList),
    [taskList],
  );
  const openTasks = useMemo(
    () => totalTasks - completedTasks,
    [totalTasks, completedTasks],
  );
  const completionPercentage = useMemo(
    () => calculateCompletionPercentage(totalTasks, completedTasks),
    [totalTasks, completedTasks],
  );
  const filteredTasks = useMemo(
    () => filterTasksByStatus(taskList, activeFilter),
    [taskList, activeFilter],
  );

  const syncTasks = useCallback(async () => {
    try {
      const tasks = await fetchTasksAction();
      if (!tasks) return;

      setTaskList((previousTasks) =>
        mergeTaskListSnapshot(previousTasks, tasks),
      );
    } catch (error) {
      logTaskError(taskMessages.sync.failed, error);
    }
  }, []);

  const createTask = useCallback(async (taskNameInput: string) => {
    try {
      const parsedTaskNames = splitTaskNames(taskNameInput);

      if (parsedTaskNames.length === 0) {
        throw new Error(TaskErrorCode.NameRequired);
      }

      const existingTaskKeys = new Set(
        taskListRef.current.map((task) => createTaskLookupKey(task.task)),
      );
      const seenTaskKeys = new Set<string>();
      const optimisticTaskIds = new Set<string>();
      const optimisticTasks: TaskRecord[] = [];
      const duplicateTasks: string[] = [];
      const invalidTasks: string[] = [];

      for (const rawTaskName of parsedTaskNames) {
        try {
          const normalizedTask = validateTaskName(rawTaskName);
          const taskLookupKey = createTaskLookupKey(normalizedTask);

          if (
            existingTaskKeys.has(taskLookupKey) ||
            seenTaskKeys.has(taskLookupKey)
          ) {
            duplicateTasks.push(normalizedTask);
            continue;
          }

          seenTaskKeys.add(taskLookupKey);

          const optimisticTaskId = createOptimisticTaskId();

          optimisticTaskIds.add(optimisticTaskId);
          optimisticTasks.push({
            id: optimisticTaskId,
            task: normalizedTask,
            done: false,
            userId: null,
          });
        } catch (error) {
          if (isTaskError(error, TaskErrorCode.NameTooLong)) {
            invalidTasks.push(rawTaskName);
            continue;
          }

          throw error;
        }
      }

      if (optimisticTasks.length === 0) {
        if (duplicateTasks.length > 0 && invalidTasks.length === 0) {
          toast.error(taskMessages.create.allDuplicates);
          return false;
        }

        if (invalidTasks.length > 0 && duplicateTasks.length === 0) {
          toast.error(taskMessages.validation.batchMaxLength);
          return false;
        }

        toast.error(taskMessages.create.failed);
        return false;
      }

      setTaskList((currentTasks) =>
        sortTasksByName(appendTasksToList(currentTasks, optimisticTasks)),
      );

      void (async () => {
        try {
          const creationResult = await createTasksAction(taskNameInput);

          setTaskList((currentTasks) => {
            const confirmedTasks = currentTasks.filter(
              (task) => !optimisticTaskIds.has(task.id),
            );

            return sortTasksByName(
              appendTasksToList(confirmedTasks, creationResult.createdTasks),
            );
          });

          if (creationResult.createdTasks.length === 0) {
            if (creationResult.duplicateTasks.length > 0) {
              toast.error(taskMessages.create.allDuplicates);
              return;
            }

            if (creationResult.invalidTasks.length > 0) {
              toast.error(taskMessages.validation.batchMaxLength);
              return;
            }

            toast.error(taskMessages.create.failed);
            return;
          }

          if (
            creationResult.duplicateTasks.length > 0 ||
            creationResult.invalidTasks.length > 0
          ) {
            toast.warning(taskMessages.create.batchSummary(creationResult));
          }
        } catch (error) {
          setTaskList((currentTasks) =>
            currentTasks.filter((task) => !optimisticTaskIds.has(task.id)),
          );

          logTaskError("Erro ao adicionar tarefa:", error);
          toast.error(taskMessages.create.failed);
        }
      })();

      return true;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === TaskErrorCode.NameRequired
      ) {
        toast.error(taskMessages.validation.required);
        return false;
      }

      if (isTaskError(error, TaskErrorCode.NameRequired)) {
        toast.error(taskMessages.validation.required);
        return false;
      }

      if (isTaskError(error, TaskErrorCode.NameTooLong)) {
        toast.error(taskMessages.validation.maxLength);
        return false;
      }

      logTaskError("Erro ao adicionar tarefa:", error);
      toast.error(taskMessages.create.failed);
      return false;
    }
  }, []);

  const deleteTask = useCallback(async (id: string, taskName: string) => {
    if (!id && !taskName) return false;

    const previousTasks = taskListRef.current;

    setTaskList((currentTasks) =>
      removeTaskFromList(currentTasks, id, taskName),
    );

    try {
      const deletedTask = await deleteTaskAction(id, taskName);
      if (deletedTask) {
        toast.success(taskMessages.delete.success);
        return true;
      }

      setTaskList(previousTasks);
      toast.error(taskMessages.delete.failed);
      return false;
    } catch (error) {
      setTaskList(previousTasks);
      logTaskError("Erro ao deletar tarefa:", error);
      toast.error(taskMessages.delete.genericError);
      return false;
    }
  }, []);

  const toggleTaskDone = useCallback(async (id: string) => {
    if (!id) return false;

    const currentTask = taskListRef.current.find((task) => task.id === id);

    if (!currentTask) {
      return false;
    }

    const optimisticTask = {
      ...currentTask,
      done: !currentTask.done,
    };

    setTaskList((currentTasks) =>
      replaceTaskInList(currentTasks, optimisticTask),
    );

    try {
      const updatedTask = await toggleTaskDoneStatusAction(id);

      if (!updatedTask) {
        setTaskList((currentTasks) =>
          replaceTaskInList(currentTasks, currentTask),
        );
        toast.error(taskMessages.update.statusFailed);
        return false;
      }

      setTaskList((currentTasks) =>
        replaceTaskInList(currentTasks, updatedTask),
      );
      return true;
    } catch (error) {
      setTaskList((currentTasks) =>
        replaceTaskInList(currentTasks, currentTask),
      );
      logTaskError("Erro ao atualizar status da tarefa:", error);
      toast.error(taskMessages.update.statusFailed);
      return false;
    }
  }, []);

  const editTask = useCallback(async (id: string, taskName: string) => {
    if (!id) return false;

    const currentTask = taskListRef.current.find((task) => task.id === id);

    if (!currentTask) {
      toast.error(taskMessages.update.notFound);
      return false;
    }

    try {
      const normalizedTask = validateTaskName(taskName);
      const optimisticTask = {
        ...currentTask,
        task: normalizedTask,
      };

      setTaskList((currentTasks) =>
        replaceTaskInList(currentTasks, optimisticTask),
      );

      const updatedTask = await updateTaskNameAction(id, normalizedTask);

      if (!updatedTask) {
        setTaskList((currentTasks) =>
          replaceTaskInList(currentTasks, currentTask),
        );
        toast.error(taskMessages.update.failed);
        return false;
      }

      setTaskList((currentTasks) =>
        replaceTaskInList(currentTasks, updatedTask),
      );
      toast.success(taskMessages.update.success);
      return true;
    } catch (error) {
      setTaskList((currentTasks) =>
        replaceTaskInList(currentTasks, currentTask),
      );

      if (isTaskError(error, TaskErrorCode.NameRequired)) {
        toast.error(taskMessages.validation.required);
        return false;
      }

      if (isTaskError(error, TaskErrorCode.DuplicateTask)) {
        toast.error(taskMessages.update.duplicate);
        return false;
      }

      if (isTaskError(error, TaskErrorCode.NameTooLong)) {
        toast.error(taskMessages.validation.maxLength);
        return false;
      }

      if (isTaskError(error, TaskErrorCode.TaskNotFound)) {
        toast.error(taskMessages.update.notFound);
        return false;
      }

      logTaskError("Erro ao editar tarefa:", error);
      toast.error(taskMessages.update.failed);
      return false;
    }
  }, []);

  const clearCompleted = useCallback(async () => {
    if (completedTasks === 0) return false;

    const previousTasks = taskListRef.current;

    setTaskList((currentTasks) => removeCompletedTasksFromList(currentTasks));

    try {
      const removedCount = await clearCompletedTasksAction();

      if (removedCount === 0) {
        setTaskList(previousTasks);
        toast.error(taskMessages.clearCompleted.empty);
        return false;
      }

      toast.success(taskMessages.clearCompleted.success(removedCount));
      return true;
    } catch (error) {
      setTaskList(previousTasks);
      logTaskError("Erro ao limpar tarefas concluidas:", error);
      toast.error(taskMessages.clearCompleted.failed);
      return false;
    }
  }, [completedTasks]);

  useEffect(() => {
    if (initialTasks === undefined) {
      queueMicrotask(() => {
        void syncTasks();
      });
    }

    const syncTasksFromVisibility = () => {
      if (document.visibilityState === "visible") {
        void syncTasks();
      }
    };

    const syncInterval = window.setInterval(() => {
      void syncTasks();
    }, TASK_SYNC_INTERVAL_IN_MS);

    window.addEventListener("focus", syncTasksFromVisibility);
    document.addEventListener("visibilitychange", syncTasksFromVisibility);

    return () => {
      window.clearInterval(syncInterval);
      window.removeEventListener("focus", syncTasksFromVisibility);
      document.removeEventListener("visibilitychange", syncTasksFromVisibility);
    };
  }, [initialTasks, syncTasks]);

  return {
    taskList,
    activeFilter,
    setActiveFilter,
    totalTasks,
    completedTasks,
    openTasks,
    completionPercentage,
    filteredTasks,
    createTask,
    editTask,
    deleteTask,
    toggleTaskDone,
    clearCompleted,
  };
};
