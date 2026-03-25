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
import { useEffect, useState } from "react";
import { Tasks } from "@prisma/client";
import { NewTask } from "@/actions/add-task";
import { deleteTask } from "@/actions/delete.task";
import { toast } from "sonner";


const Home = () => {
  
  const [taskList, setTaskList] = useState<Tasks[]>([]);
  const[task, setTask] = useState<string>("");

  const handleAddTask = async () => {
  try {
    if (task.length === 0 || !task) {
      toast.error("Por favor, preencha o campo da tarefa!");
      return;
    }

    const myNewTask = await NewTask(task);

    if (!myNewTask) return;

    setTaskList((prev) => [...prev, myNewTask]);
    setTask("");
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error);
  }
}

const hendleDeleteTask = async (id: string) => {
  if (!id) return;

  try {
    const deletedTask = await deleteTask(id);
    if (deletedTask) {
      setTaskList((prev) => prev.filter((task) => task.id !== id));
      toast.success("Tarefa deletada com sucesso!");
    }
  } catch (error) {
    throw error;
  }
};

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await getTasks();
      if (!tasks) return;
      setTaskList(tasks);
    };

    fetchTasks();
  }, []);

  return (
    <main className="w-full min-h-screen bg-gray-100 flex justify-center items-center">
     
      <div className="w-full max-w-[375px] sm:max-w-[480px] md:max-w-[640px] lg:max-w-[768px] px-3">
        <Card className="w-full p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar tarefa..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
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
            <Badge className="cursor-pointer" variant="default">
              <List />
              Todos
            </Badge>

            <Badge className="cursor-pointer" variant="outline">
              <CircleStop />
              Não finalizadas
            </Badge>

            <Badge className="cursor-pointer" variant="outline">
              <Check />
              Concluídas
            </Badge>
          </div>

          <div className="mt-2">
            {taskList.map((task) => (
              <div
                className="bg-blue-50 h-10 flex justify-between items-center"
                key={task.id}
              >
                <div className="w-2 h-full bg-blue-300"></div>

                <p className="flex-1 px-2 text-sm">{task.task}</p>

                <div className="flex items-center gap-4">
                  <EditTask />
                  <Trash2
                    size={16.5}
                    className="cursor-pointer text-red-500 mr-2" onClick={() => hendleDeleteTask(task.id) }
            
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2 items-center mt-2">
              <ListCheck size={16} className="text-blue-500 mb-2" />
              <p className="text-xs mb-2">Tarefas concluídas {3 / 3}</p>
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
              style={{ width: "50%" }}
            />
          </div>

          <div className="flex justify-end items-center mt-2 gap-2">
            <SquareSigma size={16} />
            <p className="text-xs">3 Tarefas no total</p>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Home;
