import { connection } from "next/server";
import { redirect } from "next/navigation";
import HomeClientPage from "@/app/home/page-client";
import { getAllTasks } from "@/features/tasks/service";
import { getCurrentUser } from "@/lib/auth";

const HomePage = async () => {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const initialTasks = await getAllTasks(user.id);

  return <HomeClientPage initialTasks={initialTasks} />;
};

export default HomePage;
