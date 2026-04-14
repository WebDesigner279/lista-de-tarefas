import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { EmailVerificationPanel } from "@/components/auth/email-verification-panel";
import { getCurrentUser } from "@/lib/auth";

interface ValidateAccessPageProps {
  searchParams: Promise<{
    email?: string;
    token?: string;
  }>;
}

export default async function ValidateAccessPage({
  searchParams,
}: ValidateAccessPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <AuthShell
      title="Validar acesso"
      description="Confirme seu e-mail para ativar sua conta e comecar a usar o painel."
      footer={
        <span>
          Ja confirmou o e-mail?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80"
          >
            Entrar agora
          </Link>
        </span>
      }
    >
      <EmailVerificationPanel email={params.email} token={params.token} />
    </AuthShell>
  );
}
