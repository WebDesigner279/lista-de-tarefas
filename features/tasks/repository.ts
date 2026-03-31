import prisma from "@/lib/prisma";

export const findTaskById = (id: string) => {
  return prisma.tasks.findUnique({
    where: { id },
  });
};

export const findTaskByNameInsensitive = (taskName: string) => {
  return prisma.tasks.findFirst({
    where: {
      task: {
        equals: taskName,
        mode: "insensitive",
      },
    },
  });
};

export const createTaskRecord = (taskName: string) => {
  return prisma.tasks.create({
    data: {
      task: taskName,
      done: false,
    },
  });
};

export const listTasks = () => {
  return prisma.tasks.findMany({
    orderBy: {
      task: "asc",
    },
  });
};

export const deleteTaskById = (id: string) => {
  return prisma.tasks.delete({
    where: { id },
  });
};

export const deleteTasksByNameInsensitive = (taskName: string) => {
  return prisma.tasks.deleteMany({
    where: {
      task: {
        equals: taskName,
        mode: "insensitive",
      },
    },
  });
};

export const deleteCompletedTasks = () => {
  return prisma.tasks.deleteMany({
    where: {
      done: true,
    },
  });
};

export const updateTaskDoneStatus = (id: string, done: boolean) => {
  return prisma.tasks.update({
    where: { id },
    data: { done },
  });
};
