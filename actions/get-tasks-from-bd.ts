import prisma from "@/lib/prisma";

const getTasks = async () => {
  const tasks = await prisma.tasks.findMany();
  return tasks;
};

export default getTasks;