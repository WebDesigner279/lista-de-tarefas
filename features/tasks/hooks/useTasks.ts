"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { validateTaskName } from "@/features/tasks/validators";
import { toast } from "sonner";

const TASK_EVENTS_ENDPOINT = "/api/tasks/events";

const logTaskError = (message: string, error: unknown) => {
  console.error(message, error);
};

export const useTasks = () => {
  const [taskList, setTaskList] = useState<TaskRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");

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

  const createTask = useCallback(async (taskName: string) => {
    try {
      const normalizedTask = validateTaskName(taskName);

      const creationResult = await createTasksAction(normalizedTask);

      if (creationResult.createdTasks.length === 0) {
        if (creationResult.duplicateTasks.length > 0) {
          toast.error(taskMessages.create.allDuplicates);
          return false;
        }

        if (creationResult.invalidTasks.length > 0) {
          toast.error(taskMessages.validation.batchMaxLength);
          return false;
        }

        toast.error(taskMessages.create.failed);
        return false;
      }

      setTaskList((previousTasks) =>
        appendTasksToList(previousTasks, creationResult.createdTasks),
      );

      if (
        creationResult.duplicateTasks.length > 0 ||
        creationResult.invalidTasks.length > 0
      ) {
        toast.warning(taskMessages.create.batchSummary(creationResult));
      }

      return true;
    } catch (error) {
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

    try {
      const deletedTask = await deleteTaskAction(id, taskName);
      if (deletedTask) {
        setTaskList((previousTasks) =>
          removeTaskFromList(previousTasks, id, taskName),
        );
        toast.success(taskMessages.delete.success);
        return true;
      }

      toast.error(taskMessages.delete.failed);
      return false;
    } catch (error) {
      logTaskError("Erro ao deletar tarefa:", error);
      toast.error(taskMessages.delete.genericError);
      return false;
    }
  }, []);

  const toggleTaskDone = useCallback(async (id: string) => {
    if (!id) return false;

    try {
      const updatedTask = await toggleTaskDoneStatusAction(id);

      if (!updatedTask) {
        toast.error(taskMessages.update.statusFailed);
        return false;
      }

      setTaskList((previousTasks) =>
        replaceTaskInList(previousTasks, updatedTask),
      );
      return true;
    } catch (error) {
      logTaskError("Erro ao atualizar status da tarefa:", error);
      toast.error(taskMessages.update.statusFailed);
      return false;
    }
  }, []);

  const editTask = useCallback(async (id: string, taskName: string) => {
    if (!id) return false;

    try {
      const normalizedTask = validateTaskName(taskName);
      const updatedTask = await updateTaskNameAction(id, normalizedTask);

      if (!updatedTask) {
        toast.error(taskMessages.update.failed);
        return false;
      }

      setTaskList((previousTasks) =>
        replaceTaskInList(previousTasks, updatedTask),
      );
      toast.success(taskMessages.update.success);
      return true;
    } catch (error) {
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

    try {
      const removedCount = await clearCompletedTasksAction();

      if (removedCount === 0) {
        toast.error(taskMessages.clearCompleted.empty);
        return false;
      }

      setTaskList((previousTasks) =>
        removeCompletedTasksFromList(previousTasks),
      );
      toast.success(taskMessages.clearCompleted.success(removedCount));
      return true;
    } catch (error) {
      logTaskError("Erro ao limpar tarefas concluidas:", error);
      toast.error(taskMessages.clearCompleted.failed);
      return false;
    }
  }, [completedTasks]);

  useEffect(() => {
    const initialSyncTimeout = setTimeout(() => {
      void syncTasks();
    }, 0);

    const eventSource = new EventSource(TASK_EVENTS_ENDPOINT);

    const onTasksUpdated = () => {
      void syncTasks();
    };

    eventSource.addEventListener("tasks-updated", onTasksUpdated);

    eventSource.onerror = () => {
      console.error(taskMessages.sync.sseUnavailable);
    };

    return () => {
      clearTimeout(initialSyncTimeout);
      eventSource.removeEventListener("tasks-updated", onTasksUpdated);
      eventSource.close();
    };
  }, [syncTasks]);

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
