import { BellRing, KeyRound, MailCheck, Shield } from "lucide-react";
import { ProtectedAppShell } from "@/components/protected-app-shell";
import { PasswordSettingsForm } from "@/components/password-settings-form";
import { SmtpTestForm } from "@/components/smtp-test-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getMailerSetupSummary } from "@/lib/mailer";

export default async function SettingsPage() {
  const user = await requireAuthenticatedUser();
  const smtpSetup = getMailerSetupSummary();

  return (
    <ProtectedAppShell>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/80 bg-white/90 py-0 shadow-xl shadow-slate-200/60 backdrop-blur">
            <CardHeader className="border-b border-border/70 px-6 py-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Shield className="size-5" />
                </span>
                Configuracoes de acesso
              </CardTitle>
              <CardDescription>
                Gerencie credenciais, sessao e preparo do ambiente para
                notificacoes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 py-6">
              <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
                Conta conectada:{" "}
                <span className="font-medium text-foreground">
                  {user.email}
                </span>
              </div>
              <PasswordSettingsForm />
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="border-white/80 bg-white/90 py-0 shadow-lg shadow-slate-200/50">
              <CardContent className="flex items-start gap-4 px-5 py-5">
                <span className="mt-1 flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <MailCheck className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    Recuperacao por e-mail
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {smtpSetup.configured
                      ? "SMTP configurado. Cadastro, validacao e recuperacao podem enviar e-mail real neste ambiente."
                      : "SMTP nao configurado. O fluxo de e-mail real fica bloqueado ate definir as variaveis SMTP."}
                  </p>
                  {smtpSetup.configured ? (
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>
                        Host: {smtpSetup.host}:{smtpSetup.port} | Remetente:{" "}
                        {smtpSetup.from}
                      </p>
                      <p>
                        Transporte:{" "}
                        {smtpSetup.secure ? "SSL/TLS" : "STARTTLS/PLAIN"} | TLS
                        obrigatorio: {smtpSetup.requireTls ? "sim" : "nao"}
                      </p>
                      {smtpSetup.replyTo ? (
                        <p>Reply-To: {smtpSetup.replyTo}</p>
                      ) : null}
                    </div>
                  ) : smtpSetup.missingVariables.length > 0 ? (
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Variaveis faltando:</p>
                      <p>{smtpSetup.missingVariables.join(", ")}</p>
                      <p>APP_URL atual: {smtpSetup.appUrl || "nao definida"}</p>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/80 bg-white/90 py-0 shadow-lg shadow-slate-200/50">
              <CardContent className="flex items-start gap-4 px-5 py-5">
                <span className="mt-1 flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <KeyRound className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    Rotacao de senha
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ao alterar a senha, outras sessoes sao encerradas para
                    reduzir risco de acesso residual.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/80 bg-white/90 py-0 shadow-lg shadow-slate-200/50">
              <CardContent className="flex items-start gap-4 px-5 py-5">
                <span className="mt-1 flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <BellRing className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    Proximo passo natural
                  </p>
                  <p className="text-sm text-muted-foreground">
                    O setup mais adequado para deploy e usar um SMTP
                    transacional, como Brevo ou Resend, com dominio proprio e
                    variaveis iguais entre local e Vercel.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Caminho recomendado: configurar Brevo SMTP em `.env.local`,
                    validar pelo botao de teste e depois copiar as mesmas
                    variaveis para a Vercel, ajustando apenas `APP_URL`.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/80 bg-white/90 py-0 shadow-lg shadow-slate-200/50">
              <CardContent className="px-5 py-5">
                <SmtpTestForm email={user.email} />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </ProtectedAppShell>
  );
}
