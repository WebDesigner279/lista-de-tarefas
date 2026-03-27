"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  List,
  Check,
  CircleStop,
  Trash2,
  ListCheck,
  SquareSigma,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import EditTask from "@/components/edit-task";
import { getTasks } from "@/actions/get-tasks-from-bd";
import { useCallback, useEffect, useState } from "react";
import { Tasks } from "@prisma/client";
import { NewTask } from "@/actions/add-task";
import { deleteTask } from "@/actions/delete.task";
import { toggleTaskStatus } from "@/actions/toggle-task-status";
import { toast } from "sonner";

type TaskFilter = "all" | "open" | "done";

const Home = () => {
  const maxTaskLength = 42;
  const [taskList, setTaskList] = useState<Tasks[]>([]);
  const [task, setTask] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");
  const taskRowBackgrounds = [
    "bg-blue-50",
    "bg-blue-80",
    "bg-blue-50",
    "bg-blue-80",
  ];
  const totalTasks = taskList.length;
  const completedTasks = taskList.filter((item) => item.done).length;
  const openTasks = totalTasks - completedTasks;
  const filteredTasks = taskList.filter((item) => {
    if (activeFilter === "done") return item.done;
    if (activeFilter === "open") return !item.done;
    return true;
  });
  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

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

  const handleAddTask = async () => {
    try {
      const normalizedTask = task.trim();

      if (!normalizedTask) {
        toast.error("Por favor, preencha o campo da tarefa!");
        return;
      }

      if (normalizedTask.length > maxTaskLength) {
        toast.error(`A tarefa deve ter no maximo ${maxTaskLength} caracteres.`);
        return;
      }

      const alreadyExists = taskList.some(
        (item) =>
          item.task.trim().toLowerCase() === normalizedTask.toLowerCase(),
      );

      if (alreadyExists) {
        toast.error("Essa tarefa ja existe na lista.");
        return;
      }

      const myNewTask = await NewTask(normalizedTask);

      if (!myNewTask) return;

      setTaskList((prev) => [...prev, myNewTask]);
      setTask("");
    } catch (error) {
      if (error instanceof Error && error.message === "DUPLICATE_TASK") {
        toast.error("Essa tarefa ja existe na lista.");
        return;
      }

      if (error instanceof Error && error.message === "TASK_NAME_TOO_LONG") {
        toast.error(`A tarefa deve ter no maximo ${maxTaskLength} caracteres.`);
        return;
      }

      console.error("Erro ao adicionar tarefa:", error);
      toast.error("Nao foi possivel cadastrar a tarefa.");
    }
  };

  const hendleDeleteTask = async (id: string, taskName: string) => {
    if (!id && !taskName) return;

    try {
      const deletedTask = await deleteTask(id, taskName);
      if (deletedTask) {
        setTaskList((prev) =>
          prev.filter(
            (task) =>
              task.id !== id &&
              task.task.toLowerCase() !== taskName.toLowerCase(),
          ),
        );
        toast.success("Tarefa deletada com sucesso!");
        return;
      }

      toast.error("Nao foi possivel deletar essa tarefa.");
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      toast.error("Erro ao deletar tarefa.");
    }
  };

  const handleToggleTaskStatus = async (id: string) => {
    if (!id) return;

    try {
      const updatedTask = await toggleTaskStatus(id);

      if (!updatedTask) {
        toast.error("Nao foi possivel atualizar a tarefa.");
        return;
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
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
      toast.error("Erro ao atualizar status da tarefa.");
    }
  };

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

  return (
    <main className="w-full min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="w-full max-w-[490px] sm:max-w-[480px] md:max-w-[640px] lg:max-w-[768px] px-3">
        <Card className="w-full p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar tarefa..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              maxLength={maxTaskLength}
              className="focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent"
            />
            <Button
              className="cursor-pointer"
              variant="default"
              onClick={handleAddTask}
              disabled={task.length === 0}
            >
              <Plus />
              Cadastrar
            </Button>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Badge
              className="cursor-pointer"
              variant={activeFilter === "all" ? "default" : "outline"}
              onClick={() => setActiveFilter("all")}
            >
              <List />
              Todos
            </Badge>

            <Badge
              className="cursor-pointer"
              variant={activeFilter === "open" ? "default" : "outline"}
              onClick={() => setActiveFilter("open")}
            >
              <CircleStop />
              Não finalizadas
            </Badge>

            <Badge
              className="cursor-pointer"
              variant={activeFilter === "done" ? "default" : "outline"}
              onClick={() => setActiveFilter("done")}
            >
              <Check />
              Concluídas
            </Badge>
          </div>

          <div
            className={`mt-2 ${filteredTasks.length >= 10 ? "max-h-96 overflow-y-auto" : ""}`}
          >
            {filteredTasks.map((task, index) => (
              <div
                className={`${taskRowBackgrounds[index % taskRowBackgrounds.length]} h-10 flex justify-between items-center`}
                key={task.id}
              >
                <div className="w-2 h-full bg-blue-300"></div>

                <button
                  type="button"
                  className={`flex-1 px-2 text-sm text-left cursor-pointer ${task.done ? "line-through text-gray-500" : ""}`}
                  onClick={() => handleToggleTaskStatus(task.id)}
                >
                  {task.task}
                </button>

                <div className="flex items-center gap-4">
                  <EditTask />
                  <Trash2
                    size={16.5}
                    className="cursor-pointer text-red-500 mr-2"
                    onClick={() => hendleDeleteTask(task.id, task.task)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2 items-center mt-2">
              <ListCheck size={16} className="text-blue-500 mb-2" />
              <p className="text-xs mb-2">
                {activeFilter === "open" &&
                  `Não finalizadas ${openTasks} / ${totalTasks}`}
                {activeFilter === "done" &&
                  `Concluídas ${completedTasks} / ${totalTasks}`}
                {activeFilter === "all" &&
                  `Todos ${totalTasks} / ${totalTasks}`}
              </p>
            </div>

            <Button
              className="text-red-500 h-7 cursor-pointer"
              variant="outline"
            >
              <Trash2 size={16} />
              Limpar tarefas concluídas
            </Button>
          </div>

          <div className="h-2 w-full bg-gray-100 mt-4 rounded-md">
            <div
              className="h-full bg-blue-500 rounded-md"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="flex justify-end items-center mt-2 gap-2">
            <SquareSigma size={16} />
            <p className="text-xs">{totalTasks} tarefas no total</p>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Home;
