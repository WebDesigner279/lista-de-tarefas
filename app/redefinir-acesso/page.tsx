import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordResetForm } from "@/components/auth/password-reset-form";
import { getCurrentUser } from "@/lib/auth";

interface ResetAccessPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ResetAccessPage({
  searchParams,
}: ResetAccessPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <AuthShell
      title="Redefinir acesso"
      description="Escolha uma nova senha para sua conta. O link expira automaticamente para reduzir risco de uso indevido."
      footer={
        <span>
          Quer tentar de novo?{" "}
          <Link
            href="/recuperar-acesso"
            className="font-medium text-primary hover:text-primary/80"
          >
            Solicitar novo link
          </Link>
        </span>
      }
    >
      <PasswordResetForm token={params.token ?? ""} />
    </AuthShell>
  );
}
