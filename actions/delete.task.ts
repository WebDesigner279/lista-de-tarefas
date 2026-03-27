"use server";
import prisma from "@/lib/prisma";
import { publishTaskUpdate } from "@/lib/task-events";

export const deleteTask = async (idTask: string, taskName?: string) => {
  try {
    if (!idTask && !taskName) return false;

    if (idTask) {
      try {
        await prisma.tasks.delete({
          where: {
            id: idTask,
          },
        });

        publishTaskUpdate();
        return true;
      } catch (error) {
        console.warn(
          "Falha ao deletar por id. Tentando fallback por nome.",
          error,
        );
      }
    }

    if (!taskName) return false;

    const fallbackDelete = await prisma.tasks.deleteMany({
      where: {
        task: {
          equals: taskName.trim(),
          mode: "insensitive",
        },
      },
    });

    if (fallbackDelete.count === 0) {
      return false;
    }

    publishTaskUpdate();

    return true;
  } catch (error) {
    throw error;
  }
};
