"use server";

import prisma from "@/lib/prisma";
import { publishTaskUpdate } from "@/lib/task-events";

export const toggleTaskStatus = async (idTask: string) => {
  try {
    if (!idTask) return null;

    const currentTask = await prisma.tasks.findUnique({
      where: {
        id: idTask,
      },
    });

    if (!currentTask) return null;

    const updatedTask = await prisma.tasks.update({
      where: {
        id: idTask,
      },
      data: {
        done: !currentTask.done,
      },
    });

    publishTaskUpdate();

    return updatedTask;
  } catch (error) {
    throw error;
  }
};
