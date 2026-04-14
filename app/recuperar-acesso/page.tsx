import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordResetRequestForm } from "@/components/auth/password-reset-request-form";
import { getCurrentUser } from "@/lib/auth";

export default async function RecoverAccessPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      title="Recuperar acesso"
      description="Informe seu e-mail e, se ele estiver cadastrado, enviaremos um link para voce criar uma nova senha."
      footer={
        <span>
          Lembrou a senha?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Voltar para login
          </Link>
        </span>
      }
    >
      <PasswordResetRequestForm />
    </AuthShell>
  );
}
