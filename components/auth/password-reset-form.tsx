"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import { KeyRound } from "lucide-react";
import { resetPasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

interface PasswordResetFormProps {
  token: string;
}

export const PasswordResetForm = ({ token }: PasswordResetFormProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSuccess(false);

    startTransition(async () => {
      const result = await resetPasswordAction({
        token,
        password,
        confirmPassword,
      });

      setIsSuccess(result.status === "success");
      setMessage(
        result.message ??
          (result.status === "success"
            ? "Senha atualizada com sucesso."
            : "Nao foi possivel redefinir a senha."),
      );

      if (result.status === "success") {
        setPassword("");
        setConfirmPassword("");
      }
    });
  };

  if (!token) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        O link de redefinicao esta incompleto. Solicite um novo acesso.
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="new-password"
        >
          Nova senha
        </label>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          placeholder="Digite a nova senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="confirm-new-password"
        >
          Confirmar nova senha
        </label>
        <PasswordInput
          id="confirm-new-password"
          autoComplete="new-password"
          placeholder="Repita a nova senha"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>

      {message ? (
        <div
          className={
            isSuccess
              ? "rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground"
              : "rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
          <p>{message}</p>
          {isSuccess ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Agora voce pode{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                entrar com a nova senha
              </Link>
              .
            </p>
          ) : null}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full cursor-pointer"
        disabled={isPending}
      >
        <KeyRound />
        {isPending ? "Atualizando senha..." : "Salvar nova senha"}
      </Button>
    </form>
  );
};
