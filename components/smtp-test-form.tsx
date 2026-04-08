"use client";

import { useTransition, useState } from "react";
import { MailCheck } from "lucide-react";
import { testSmtpDeliveryAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

interface SmtpTestFormProps {
  email: string;
}

export const SmtpTestForm = ({ email }: SmtpTestFormProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleTest = () => {
    setMessage(null);
    setDetails(null);

    startTransition(async () => {
      const result = await testSmtpDeliveryAction();

      setIsSuccess(result.status === "success");
      setMessage(result.message ?? null);
      setDetails(result.details ?? null);
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-background px-4 py-4">
      <div className="space-y-1">
        <p className="font-medium text-foreground">Teste de entrega SMTP</p>
        <p className="text-sm text-muted-foreground">
          Envia um e-mail real para {email} usando a configuracao atual do
          ambiente.
        </p>
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
          {details ? (
            <p className="mt-1 text-xs text-muted-foreground">{details}</p>
          ) : null}
        </div>
      ) : null}

      <Button
        type="button"
        className="cursor-pointer"
        onClick={handleTest}
        disabled={isPending}
      >
        <MailCheck />
        {isPending ? "Testando SMTP..." : "Enviar e-mail de teste"}
      </Button>
    </div>
  );
};
