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

    const formData = new FormData(event.currentTarget);
    const submittedName = String(formData.get("name") ?? name);
    const submittedEmail = String(formData.get("email") ?? email);
    const submittedPassword = String(formData.get("password") ?? password);
    const submittedConfirmPassword = String(
      formData.get("confirmPassword") ?? confirmPassword,
    );

    setName(submittedName);
    setEmail(submittedEmail);
    setPassword(submittedPassword);
    setConfirmPassword(submittedConfirmPassword);

    startTransition(async () => {
      const result = await registerAction({
        name: submittedName,
        email: submittedEmail,
        password: submittedPassword,
        confirmPassword: submittedConfirmPassword,
      });

      if (result.status === "error") {
        setMessage(result.message ?? "Nao conseguimos criar sua conta.");
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
          name="name"
          autoComplete="name"
          placeholder="Como seu nome deve aparecer"
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
          name="email"
          type="email"
          autoComplete="email"
          placeholder="seuemail@exemplo.com"
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
            name="password"
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
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        Crie uma senha com pelo menos 8 caracteres, usando letras e numeros para
        proteger sua conta.
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
