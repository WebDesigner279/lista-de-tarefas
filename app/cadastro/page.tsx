import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Criar conta"
      description="Cadastre uma conta individual para separar tarefas, sessao e historico de acesso."
      footer={
        <span>
          Ja possui cadastro?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Entrar agora
          </Link>
        </span>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
