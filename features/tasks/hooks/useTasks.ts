"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Tasks } from "@prisma/client";
import { getTasks } from "@/actions/get-tasks";
import { createTaskAction } from "@/actions/create-task";
import { deleteTaskAction } from "@/actions/delete-task";
import { toggleTaskStatus } from "@/actions/toggle-task-status";
import { TaskFilter } from "@/features/tasks/types";
import { toast } from "sonner";

export const useTasks = () => {
  const [taskList, setTaskList] = useState<Tasks[]>([]);
  const [currentTaskInput, setCurrentTaskInput] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");

  const totalTasks = useMemo(() => taskList.length, [taskList]);
  const completedTasks = useMemo(
    () => taskList.filter((item) => item.done).length,
    [taskList],
  );
  const openTasks = useMemo(
    () => totalTasks - completedTasks,
    [totalTasks, completedTasks],
  );
  const completionPercentage = useMemo(
    () =>
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    [totalTasks, completedTasks],
  );
  const filteredTasks = useMemo(
    () =>
      taskList.filter((item) => {
        if (activeFilter === "done") return item.done;
        if (activeFilter === "open") return !item.done;
        return true;
      }),
    [taskList, activeFilter],
  );

  const buildTaskSignature = useCallback((tasks: Tasks[]) => {
    return tasks
      .map((item) => `${item.id}:${item.task}:${item.done}`)
      .join("|");
  }, []);

  const syncTasks = useCallback(async () => {
    try {
      const tasks = await getTasks();
      if (!tasks) return;

      setTaskList((prev) => {
        const hasChanged =
          buildTaskSignature(prev) !== buildTaskSignature(tasks);

        return hasChanged ? tasks : prev;
      });
    } catch (error) {
      console.error("Erro ao sincronizar tarefas:", error);
    }
  }, [buildTaskSignature]);

  const createTask = useCallback(async (taskName: string) => {
    try {
      const normalizedTask = taskName.trim();

      if (!normalizedTask) {
        toast.error("Por favor, preencha o campo da tarefa!");
        return false;
      }

      const myNewTask = await createTaskAction(normalizedTask);

      if (!myNewTask) {
        toast.error("Nao foi possivel cadastrar a tarefa.");
        return false;
      }

      setTaskList((prev) => [...prev, myNewTask]);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === "DUPLICATE_TASK") {
        toast.error("Essa tarefa ja existe na lista.");
        return false;
      }

      if (error instanceof Error && error.message === "TASK_NAME_TOO_LONG") {
        toast.error("A tarefa deve ter no maximo 42 caracteres.");
        return false;
      }

      console.error("Erro ao adicionar tarefa:", error);
      toast.error("Nao foi possivel cadastrar a tarefa.");
      return false;
    }
  }, []);

  const deleteTask = useCallback(async (id: string, taskName: string) => {
    if (!id && !taskName) return false;

    try {
      const deletedTask = await deleteTaskAction(id, taskName);
      if (deletedTask) {
        setTaskList((prev) =>
          prev.filter(
            (task) =>
              task.id !== id &&
              task.task.toLowerCase() !== taskName.toLowerCase(),
          ),
        );
        toast.success("Tarefa deletada com sucesso!");
        return true;
      }

      toast.error("Nao foi possivel deletar essa tarefa.");
      return false;
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      toast.error("Erro ao deletar tarefa.");
      return false;
    }
  }, []);

  const toggleTaskDone = useCallback(async (id: string) => {
    if (!id) return false;

    try {
      const updatedTask = await toggleTaskStatus(id);

      if (!updatedTask) {
        toast.error("Nao foi possivel atualizar a tarefa.");
        return false;
      }

      setTaskList((prev) =>
        prev.map((item) =>
          item.id === updatedTask.id
            ? {
                ...item,
                done: updatedTask.done,
              }
            : item,
        ),
      );
      return true;
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
      toast.error("Erro ao atualizar status da tarefa.");
      return false;
    }
  }, []);

  // SSE subscription
  useEffect(() => {
    const initialSyncTimeout = setTimeout(() => {
      void syncTasks();
    }, 0);

    const eventSource = new EventSource("/api/tasks/events");

    const onTasksUpdated = () => {
      void syncTasks();
    };

    eventSource.addEventListener("tasks-updated", onTasksUpdated);

    eventSource.onerror = () => {
      console.error("Conexão SSE indisponível. Tentando reconectar...");
    };

    return () => {
      clearTimeout(initialSyncTimeout);
      eventSource.removeEventListener("tasks-updated", onTasksUpdated);
      eventSource.close();
    };
  }, [syncTasks]);

  return {
    taskList,
    currentTaskInput,
    setCurrentTaskInput,
    activeFilter,
    setActiveFilter,
    totalTasks,
    completedTasks,
    openTasks,
    completionPercentage,
    filteredTasks,
    createTask,
    deleteTask,
    toggleTaskDone,
  };
};
