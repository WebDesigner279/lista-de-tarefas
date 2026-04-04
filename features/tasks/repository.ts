import prisma from "@/lib/prisma";

const orderTasksByName = {
  task: "asc",
} as const;

const createTaskNameInsensitiveWhere = (taskName: string) => {
  return {
    task: {
      equals: taskName,
      mode: "insensitive" as const,
    },
  };
};

export const findTaskById = (id: string) => {
  return prisma.tasks.findUnique({
    where: { id },
  });
};

export const findTaskByNameInsensitive = (taskName: string) => {
  return prisma.tasks.findFirst({
    where: createTaskNameInsensitiveWhere(taskName),
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
    orderBy: orderTasksByName,
  });
};

export const deleteTaskById = (id: string) => {
  return prisma.tasks.delete({
    where: { id },
  });
};

export const deleteTasksByNameInsensitive = (taskName: string) => {
  return prisma.tasks.deleteMany({
    where: createTaskNameInsensitiveWhere(taskName),
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

export const updateTaskNameById = (id: string, taskName: string) => {
  return prisma.tasks.update({
    where: { id },
    data: { task: taskName },
  });
};
