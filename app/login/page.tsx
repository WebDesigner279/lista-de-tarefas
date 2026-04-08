import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Entrar"
      description="Acesse seu ambiente para gerenciar tarefas com seguranca e contexto proprio por usuario."
      footer={
        <span>
          Ainda nao tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-medium text-primary hover:text-primary/80"
          >
            Criar agora
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
