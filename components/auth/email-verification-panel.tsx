"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { MailCheck, RefreshCcw } from "lucide-react";
import {
  resendEmailVerificationAction,
  verifyEmailAction,
} from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailVerificationPanelProps {
  email?: string;
  token?: string;
}

export const EmailVerificationPanel = ({
  email: initialEmail = "",
  token = "",
}: EmailVerificationPanelProps) => {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!token) {
      return;
    }

    startTransition(async () => {
      const result = await verifyEmailAction(token);

      setIsSuccess(result.status === "success");
      setMessage(result.message ?? null);

      if (result.status === "success") {
        router.replace(result.redirectTo ?? "/dashboard");
        router.refresh();
      }
    });
  }, [router, token]);

  const handleResend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSuccess(false);

    startTransition(async () => {
      const result = await resendEmailVerificationAction(email);
      setIsSuccess(result.status === "success");
      setMessage(result.message ?? null);
    });
  };

  if (token) {
    return (
      <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
        {message ?? "Confirmando seu e-mail..."}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-4 text-sm text-foreground">
        <div className="flex items-start gap-3">
          <MailCheck className="mt-0.5 size-4 text-primary" />
          <div>
            <p className="font-medium">
              Confirme seu e-mail antes do primeiro acesso.
            </p>
            <p className="mt-1 text-muted-foreground">
              Assim que a confirmacao for concluida, sua conta estara pronta
              para uso.
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleResend}>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="verification-email"
          >
            E-mail da conta
          </label>
          <Input
            id="verification-email"
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
              isSuccess
                ? "rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground"
                : "rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
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
          <RefreshCcw />
          {isPending ? "Enviando..." : "Reenviar e-mail de confirmacao"}
        </Button>
      </form>
    </div>
  );
};
