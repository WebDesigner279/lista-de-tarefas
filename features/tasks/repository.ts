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

export const findTaskById = (userId: string, id: string) => {
  return prisma.tasks.findFirst({
    where: { id, userId },
  });
};

export const findTaskByNameInsensitive = (userId: string, taskName: string) => {
  return prisma.tasks.findFirst({
    where: {
      userId,
      ...createTaskNameInsensitiveWhere(taskName),
    },
  });
};

export const findTasksByNamesInsensitive = (
  userId: string,
  taskNames: string[],
) => {
  if (taskNames.length === 0) {
    return Promise.resolve([]);
  }

  return prisma.tasks.findMany({
    where: {
      userId,
      OR: taskNames.map(createTaskNameInsensitiveWhere),
    },
  });
};

export const createTaskRecord = (userId: string, taskName: string) => {
  return prisma.tasks.create({
    data: {
      task: taskName,
      done: false,
      userId,
    },
  });
};

export const listTasks = (userId: string) => {
  return prisma.tasks.findMany({
    where: { userId },
    orderBy: orderTasksByName,
  });
};

export const deleteTaskById = (userId: string, id: string) => {
  return prisma.tasks.deleteMany({
    where: { id, userId },
  });
};

export const deleteTasksByNameInsensitive = (
  userId: string,
  taskName: string,
) => {
  return prisma.tasks.deleteMany({
    where: {
      userId,
      ...createTaskNameInsensitiveWhere(taskName),
    },
  });
};

export const deleteCompletedTasks = (userId: string) => {
  return prisma.tasks.deleteMany({
    where: {
      userId,
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
