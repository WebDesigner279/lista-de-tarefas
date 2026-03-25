"use server";
import prisma from "@/lib/prisma";

export const NewTask = async (tarefa: string) => {
  try {
    if (!tarefa) return;

    const newTask = await prisma.tasks.create({
      data: {
        task: tarefa,
        done: false,
      },
    });

    return newTask;
  } catch (error) {
    throw error;
  }
};
