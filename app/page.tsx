import { redirect } from "next/navigation";
import { getCurrentUser, hasRegisteredUsers } from "@/lib/auth";

export default async function Page() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const hasUsers = await hasRegisteredUsers();

  redirect(hasUsers ? "/login" : "/cadastro");
}
