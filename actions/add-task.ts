"use server";
import prisma from "@/lib/prisma";
import { publishTaskUpdate } from "@/lib/task-events";

export const NewTask = async (tarefa: string) => {
  try {
    const normalizedTask = tarefa.trim();
    const maxTaskLength = 42;

    if (!normalizedTask) return;

    if (normalizedTask.length > maxTaskLength) {
      throw new Error("TASK_NAME_TOO_LONG");
    }

    const duplicatedTask = await prisma.tasks.findFirst({
      where: {
        task: {
          equals: normalizedTask,
          mode: "insensitive",
        },
      },
    });

    if (duplicatedTask) {
      throw new Error("DUPLICATE_TASK");
    }

    const newTask = await prisma.tasks.create({
      data: {
        task: normalizedTask,
        done: false,
      },
    });

    publishTaskUpdate();

    return newTask;
  } catch (error) {
    throw error;
  }
};
