import { connection } from "next/server";
import HomeClientPage from "@/app/home/page-client";
import { getAllTasks } from "@/features/tasks/service";

const HomePage = async () => {
  await connection();

  const initialTasks = await getAllTasks();

  return <HomeClientPage initialTasks={initialTasks} />;
};

export default HomePage;
