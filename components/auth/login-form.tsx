"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await loginAction({ email, password });

      if (result.status === "error") {
        setMessage(result.message ?? "Nao foi possivel entrar.");
        return;
      }

      router.replace(result.redirectTo ?? "/home");
      router.refresh();
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="login-email"
        >
          E-mail
        </label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="login-password"
          >
            Senha
          </label>
          <Link
            href="/recuperar-acesso"
            className="text-sm text-primary transition-colors hover:text-primary/80"
          >
            Esqueci minha senha
          </Link>
        </div>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {message ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {message}
          {message.includes("confirmado") ? (
            <div className="mt-2">
              <Link
                href="/validar-acesso"
                className="font-medium text-primary hover:text-primary/80"
              >
                Reenviar link de validacao
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full cursor-pointer"
        disabled={isPending}
      >
        <LogIn />
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};
