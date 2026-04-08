import { UserRound } from "lucide-react";
import { ProtectedAppShell } from "@/components/protected-app-shell";
import { ProfileForm } from "@/components/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuthenticatedUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await requireAuthenticatedUser();

  return (
    <ProtectedAppShell>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-white/80 bg-white/90 py-0 shadow-xl shadow-slate-200/60 backdrop-blur">
            <CardHeader className="border-b border-border/70 px-6 py-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UserRound className="size-5" />
                </span>
                Perfil
              </CardTitle>
              <CardDescription>
                Atualize seus dados principais e acompanhe um resumo da sua
                conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-6">
              <ProfileForm initialName={user.name} email={user.email} />
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/90 py-0 shadow-lg shadow-slate-200/50">
            <CardHeader className="border-b border-border/70 px-6 py-6">
              <CardTitle className="text-xl">Conta</CardTitle>
              <CardDescription>
                Seus dados pessoais e de acesso ficam centralizados aqui, sem
                misturar com os indicadores do produto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 py-6 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                <p className="font-medium text-foreground">Nome atual</p>
                <p className="mt-1">{user.name}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                <p className="font-medium text-foreground">E-mail confirmado</p>
                <p className="mt-1">{user.email}</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </ProtectedAppShell>
  );
}
