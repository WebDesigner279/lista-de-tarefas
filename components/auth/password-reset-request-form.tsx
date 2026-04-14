"use client";

import { FormEvent, useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { requestPasswordResetAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const PasswordResetRequestForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsError(false);

    const formData = new FormData(event.currentTarget);
    const submittedEmail = String(formData.get("email") ?? email);

    setEmail(submittedEmail);

    startTransition(async () => {
      const result = await requestPasswordResetAction(submittedEmail);

      setIsError(result.status === "error");
      setMessage(
        result.message ??
          "Se o e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.",
      );
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="reset-email"
        >
          E-mail da conta
        </label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="seuemail@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      {message ? (
        <div
          className={
            isError
              ? "rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              : "rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground"
          }
        >
          <p>{message}</p>
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full cursor-pointer"
        disabled={isPending}
      >
        <Mail />
        {isPending ? "Enviando link..." : "Enviar link por e-mail"}
      </Button>
    </form>
  );
};
