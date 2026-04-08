"use client";

import { FormEvent, useState, useTransition } from "react";
import { changePasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

export const PasswordSettingsForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setIsSuccess(result.status === "success");
      setMessage(result.message ?? null);

      if (result.status === "success") {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          htmlFor="current-password"
          className="text-sm font-medium text-foreground"
        >
          Senha atual
        </label>
        <PasswordInput
          id="current-password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="new-password-settings"
            className="text-sm font-medium text-foreground"
          >
            Nova senha
          </label>
          <PasswordInput
            id="new-password-settings"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirm-password-settings"
            className="text-sm font-medium text-foreground"
          >
            Confirmar nova senha
          </label>
          <PasswordInput
            id="confirm-password-settings"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Ao alterar a senha, as outras sessoes ativas sao encerradas
        automaticamente.
      </div>

      {message ? (
        <div
          className={
            isSuccess
              ? "rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground"
              : "rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
          {message}
        </div>
      ) : null}

      <Button type="submit" className="cursor-pointer" disabled={isPending}>
        {isPending ? "Atualizando..." : "Atualizar senha"}
      </Button>
    </form>
  );
};
