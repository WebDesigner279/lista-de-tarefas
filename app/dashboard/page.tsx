import {
  CheckCheck,
  CircleDashed,
  Clock3,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";
import { ProtectedAppShell } from "@/components/protected-app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getAllTasks } from "@/features/tasks/service";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();
  const tasks = await getAllTasks(user.id);
  const completedTasks = tasks.filter((task) => task.done).length;
  const openTasks = tasks.length - completedTasks;
  const listedTasks = tasks;

  return (
    <ProtectedAppShell>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/80 bg-white/90 py-0 shadow-xl shadow-slate-200/60 backdrop-blur">
            <CardHeader className="border-b border-border/70 px-6 py-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <LayoutDashboard className="size-5" />
                </span>
                Dashboard
              </CardTitle>
              <CardDescription>
                Visao consolidada das suas tarefas, com leitura rapida dos
                indicadores principais.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 px-6 py-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background px-5 py-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <ListChecks className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {tasks.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background px-5 py-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCheck className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm text-muted-foreground">Concluidas</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {completedTasks}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background px-5 py-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <CircleDashed className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm text-muted-foreground">Em aberto</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {openTasks}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/90 py-0 shadow-xl shadow-slate-200/60 backdrop-blur">
            <CardHeader className="border-b border-border/70 px-6 py-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Clock3 className="size-5 text-primary" />
                Tarefas da lista
              </CardTitle>
              <CardDescription>
                Lista atual de tarefas usada para compor os indicadores do
                dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-6">
              {listedTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ainda nao existem tarefas cadastradas para exibir aqui.
                </p>
              ) : (
                <div className="space-y-3">
                  {listedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-2xl border border-border/70 bg-background px-4 py-3"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {task.task}
                      </span>
                      <span
                        className={
                          task.done
                            ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                        }
                      >
                        {task.done ? "Concluida" : "Em aberto"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </ProtectedAppShell>
  );
}
