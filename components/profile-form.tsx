"use client";

import { FormEvent, useState, useTransition } from "react";
import { updateProfileAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileFormProps {
  initialName: string;
  email: string;
}

export const ProfileForm = ({ initialName, email }: ProfileFormProps) => {
  const [name, setName] = useState(initialName);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await updateProfileAction({ name });
      setIsSuccess(result.status === "success");
      setMessage(result.message ?? null);
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          htmlFor="profile-name"
          className="text-sm font-medium text-foreground"
        >
          Nome de exibicao
        </label>
        <Input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Seu nome"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="profile-email"
          className="text-sm font-medium text-foreground"
        >
          E-mail
        </label>
        <Input id="profile-email" value={email} readOnly disabled />
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
        {isPending ? "Salvando..." : "Salvar perfil"}
      </Button>
    </form>
  );
};
