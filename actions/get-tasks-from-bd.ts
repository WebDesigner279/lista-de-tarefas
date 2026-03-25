"use server";
import prisma from "@/lib/prisma";

export const getTasks = async () => {
 try {
    const tasks = await prisma.tasks.findMany();

    if (!tasks) {
      console.log("Nenhuma tarefa encontrada.");
      return null;
    }
    return tasks;
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return null;
 }
};
