"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export const RegisterForm = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await registerAction({
        name,
        email,
        password,
        confirmPassword,
      });

      if (result.status === "error") {
        setMessage(result.message ?? "Nao foi possivel criar a conta.");
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
          htmlFor="register-name"
        >
          Nome
        </label>
        <Input
          id="register-name"
          autoComplete="name"
          placeholder="Como voce quer aparecer"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="register-email"
        >
          E-mail
        </label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="register-password"
          >
            Senha
          </label>
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            placeholder="Minimo de 8 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="register-password-confirmation"
          >
            Confirmar senha
          </label>
          <PasswordInput
            id="register-password-confirmation"
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        Use uma senha com pelo menos 8 caracteres, combinando letras e numeros.
      </div>

      {message ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {message}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full cursor-pointer"
        disabled={isPending}
      >
        <UserPlus />
        {isPending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
};
