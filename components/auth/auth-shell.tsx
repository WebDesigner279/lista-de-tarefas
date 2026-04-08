import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandMark } from "@/components/brand-mark";

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export const AuthShell = ({
  title,
  description,
  children,
  footer,
}: AuthShellProps) => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_45%,#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_46%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_38%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="hidden rounded-[2rem] border border-white/60 bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-slate-300/60 lg:block">
            <BrandMark
              className="items-start text-white"
              titleClassName="text-white"
              subtitle="Organizacao multiusuario com acesso protegido"
            />

            <div className="mt-10 space-y-4">
              <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-white">
                Um painel de tarefas com hierarquia visual clara e autenticacao
                real.
              </h1>
              <p className="max-w-xl text-base text-slate-300">
                Cada pessoa acessa apenas as proprias tarefas, com sessao
                segura, recuperacao de acesso e navegacao adaptada para desktop
                e mobile.
              </p>
            </div>

            <div className="mt-10 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex items-center gap-3 text-sm font-medium text-white">
                  <ShieldCheck className="size-4 text-sky-300" />
                  Validacao de acesso em rota e nas server actions
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex items-center gap-3 text-sm font-medium text-white">
                  <Sparkles className="size-4 text-cyan-300" />
                  Fluxo de login, cadastro e redefinicao com foco em usabilidade
                </div>
              </div>
            </div>
          </section>

          <Card className="border-white/80 bg-white/90 py-0 shadow-2xl shadow-slate-200/70 backdrop-blur">
            <CardHeader className="gap-3 border-b border-border/70 px-6 py-6">
              <div className="flex items-center justify-between gap-3">
                <BrandMark compact subtitle="Acesso seguro" />
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Voltar
                </Link>
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  {title}
                </CardTitle>
                <CardDescription className="text-sm leading-6">
                  {description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 px-6 py-6">
              {children}
            </CardContent>

            <div className="border-t border-border/70 bg-muted/40 px-6 py-4 text-sm text-muted-foreground">
              {footer}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};
