import "server-only";

import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { AuthError, AuthErrorCode } from "@/features/auth/errors";

interface MailerConfig {
  host: string;
  port: number;
  secure: boolean;
  requireTls: boolean;
  user: string;
  pass: string;
  from: string;
  replyTo?: string;
  connectionTimeout: number;
  greetingTimeout: number;
  socketTimeout: number;
  tlsServername?: string;
}

const REQUIRED_SMTP_VARIABLES = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM_EMAIL",
] as const;

const APP_NAME = "Lista de Tarefas";
const APP_TAGLINE = "Organizacao segura para o seu fluxo diario";
const APP_PRIMARY_COLOR = "#6d5efc";
const APP_PRIMARY_SOFT = "#ede9fe";
const APP_BACKGROUND = "#f8fafc";
const APP_SURFACE = "#ffffff";
const APP_BORDER = "#e2e8f0";
const APP_TEXT = "#0f172a";
const APP_MUTED = "#475569";

interface TransactionalEmailOptions {
  preheader: string;
  eyebrow: string;
  title: string;
  greeting: string;
  intro: string;
  actionLabel: string;
  actionUrl: string;
  helper: string;
  note?: string;
}

const parsePort = (value: string | undefined, fallback: number) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const getAppUrl = () => {
  return process.env.APP_URL?.trim() || "http://localhost:3000";
};

const escapeHtml = (value: string) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const renderTransactionalEmailText = (options: TransactionalEmailOptions) => {
  return [
    APP_NAME,
    options.eyebrow,
    "",
    options.greeting,
    "",
    options.intro,
    `Acesse: ${options.actionUrl}`,
    "",
    options.helper,
    options.note ? `\n${options.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

const renderTransactionalEmailHtml = (options: TransactionalEmailOptions) => {
  const preheader = escapeHtml(options.preheader);
  const eyebrow = escapeHtml(options.eyebrow);
  const title = escapeHtml(options.title);
  const greeting = escapeHtml(options.greeting);
  const intro = escapeHtml(options.intro);
  const actionLabel = escapeHtml(options.actionLabel);
  const actionUrl = escapeHtml(options.actionUrl);
  const helper = escapeHtml(options.helper);
  const note = options.note ? escapeHtml(options.note) : null;

  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;visibility:hidden;">${preheader}</div>
    <div style="margin:0;padding:32px 16px;background:${APP_BACKGROUND};font-family:Arial,sans-serif;color:${APP_TEXT};">
      <div style="max-width:640px;margin:0 auto;">
        <div style="margin-bottom:20px;padding:0 4px;">
          <div style="display:inline-flex;align-items:center;gap:12px;">
            <div style="width:44px;height:44px;border-radius:16px;background:${APP_PRIMARY_COLOR};color:#ffffff;text-align:center;line-height:44px;font-size:22px;font-weight:700;">L</div>
            <div>
              <div style="font-size:18px;font-weight:700;color:${APP_TEXT};">${APP_NAME}</div>
              <div style="font-size:13px;color:${APP_MUTED};">${APP_TAGLINE}</div>
            </div>
          </div>
        </div>

        <div style="background:${APP_SURFACE};border:1px solid ${APP_BORDER};border-radius:28px;overflow:hidden;box-shadow:0 24px 50px rgba(15,23,42,0.08);">
          <div style="padding:32px 32px 16px;background:linear-gradient(135deg, ${APP_PRIMARY_SOFT} 0%, #eff6ff 100%);border-bottom:1px solid ${APP_BORDER};">
            <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:rgba(109,94,252,0.12);color:${APP_PRIMARY_COLOR};font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">${eyebrow}</div>
            <h1 style="margin:18px 0 10px;font-size:30px;line-height:1.2;color:${APP_TEXT};">${title}</h1>
            <p style="margin:0;font-size:15px;line-height:1.7;color:${APP_MUTED};">${intro}</p>
          </div>

          <div style="padding:28px 32px 32px;">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${APP_TEXT};">${greeting}</p>
            <div style="margin:28px 0;">
              <a href="${actionUrl}" style="display:inline-block;padding:14px 20px;border-radius:16px;background:${APP_PRIMARY_COLOR};color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">${actionLabel}</a>
            </div>
            <div style="margin:0 0 18px;padding:16px 18px;border:1px solid ${APP_BORDER};border-radius:18px;background:#f8fafc;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${APP_TEXT};">Se o botao nao abrir, use este link:</p>
              <p style="margin:0;word-break:break-all;font-size:13px;line-height:1.6;color:${APP_MUTED};">${actionUrl}</p>
            </div>
            <p style="margin:0;font-size:13px;line-height:1.7;color:${APP_MUTED};">${helper}</p>
            ${note ? `<p style="margin:14px 0 0;font-size:13px;line-height:1.7;color:${APP_MUTED};">${note}</p>` : ""}
          </div>
        </div>

        <p style="margin:18px 4px 0;font-size:12px;line-height:1.6;color:${APP_MUTED};">Mensagem automatica do ${APP_NAME}. Se voce nao reconhece esta solicitacao, pode ignorar este e-mail.</p>
      </div>
    </div>
  `;
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
};

const ensureProductionAppUrl = (appUrl: string) => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (!appUrl.startsWith("https://")) {
    throw new AuthError(
      AuthErrorCode.EmailDeliveryUnavailable,
      "APP_URL precisa usar HTTPS em producao.",
    );
  }
};

const getMailerConfig = (): MailerConfig => {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM_EMAIL?.trim();
  const replyTo = process.env.SMTP_REPLY_TO_EMAIL?.trim();
  const appUrl = getAppUrl();

  if (!host || !user || !pass || !from) {
    throw new AuthError(
      AuthErrorCode.EmailDeliveryUnavailable,
      "SMTP nao configurado.",
    );
  }

  ensureProductionAppUrl(appUrl);

  return {
    host,
    port: parsePort(process.env.SMTP_PORT, 587),
    secure: parseBoolean(process.env.SMTP_SECURE, false),
    requireTls: parseBoolean(process.env.SMTP_REQUIRE_TLS, true),
    user,
    pass,
    from,
    replyTo: replyTo || undefined,
    connectionTimeout: parsePort(process.env.SMTP_CONNECTION_TIMEOUT_MS, 15000),
    greetingTimeout: parsePort(process.env.SMTP_GREETING_TIMEOUT_MS, 10000),
    socketTimeout: parsePort(process.env.SMTP_SOCKET_TIMEOUT_MS, 20000),
    tlsServername: process.env.SMTP_TLS_SERVERNAME?.trim() || undefined,
  };
};

const createTransporter = () => {
  const config = getMailerConfig();
  const transportOptions: SMTPTransport.Options = {
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTls,
    connectionTimeout: config.connectionTimeout,
    greetingTimeout: config.greetingTimeout,
    socketTimeout: config.socketTimeout,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: config.tlsServername
      ? {
          servername: config.tlsServername,
        }
      : undefined,
  };

  return {
    config,
    transporter: nodemailer.createTransport(transportOptions),
  };
};

export const getMailerSetupSummary = () => {
  const missingVariables = REQUIRED_SMTP_VARIABLES.filter((variableName) => {
    return !process.env[variableName]?.trim();
  });
  const appUrl = process.env.APP_URL?.trim();

  try {
    const config = getMailerConfig();

    return {
      configured: true,
      host: config.host,
      port: config.port,
      secure: config.secure,
      requireTls: config.requireTls,
      from: config.from,
      replyTo: config.replyTo,
      appUrl,
      missingVariables,
    };
  } catch {
    return {
      configured: false,
      host: undefined,
      port: undefined,
      secure: undefined,
      requireTls: undefined,
      from: undefined,
      replyTo: undefined,
      appUrl,
      missingVariables,
    };
  }
};

export const verifySmtpConnection = async () => {
  const { transporter, config } = createTransporter();

  try {
    await transporter.verify();

    return {
      host: config.host,
      port: config.port,
      secure: config.secure,
      from: config.from,
    };
  } catch (error) {
    console.error("Falha ao validar conexao SMTP.", error);
    throw new AuthError(
      AuthErrorCode.EmailDeliveryFailed,
      "Falha ao validar conexao SMTP.",
    );
  }
};

export const sendSmtpTestEmail = async (options: {
  to: string;
  name: string;
}) => {
  const { transporter, config } = createTransporter();
  const dashboardUrl = new URL("/dashboard", getAppUrl()).toString();
  const template = {
    preheader: "Diagnostico SMTP executado com sucesso.",
    eyebrow: "Diagnostico SMTP",
    title: "Teste de entrega concluido",
    greeting: `Ola, ${options.name}.`,
    intro:
      "Este e um envio tecnico para validar a configuracao SMTP atual do projeto e confirmar que a entrega de e-mails esta operacional.",
    actionLabel: "Abrir dashboard",
    actionUrl: dashboardUrl,
    helper:
      "Este e-mail nao redefine senha, nao confirma cadastro e nao altera o estado da sua conta.",
    note: "Se voce recebeu esta mensagem, o ambiente esta apto a enviar os e-mails reais de validacao e recuperacao.",
  } satisfies TransactionalEmailOptions;

  try {
    await transporter.sendMail({
      from: config.from,
      replyTo: config.replyTo,
      to: options.to,
      subject: "[DIAGNOSTICO SMTP] Lista de Tarefas",
      text: renderTransactionalEmailText(template),
      html: renderTransactionalEmailHtml(template),
    });

    return {
      host: config.host,
      port: config.port,
      secure: config.secure,
      requireTls: config.requireTls,
      from: config.from,
      replyTo: config.replyTo,
    };
  } catch (error) {
    console.error("Falha ao enviar e-mail de teste SMTP.", error);
    throw new AuthError(
      AuthErrorCode.EmailDeliveryFailed,
      "Falha ao enviar e-mail de teste SMTP.",
    );
  }
};

export const sendPasswordResetEmail = async (options: {
  to: string;
  name: string;
  resetPath: string;
}) => {
  const resetUrl = new URL(options.resetPath, getAppUrl()).toString();
  const { transporter, config } = createTransporter();
  const template = {
    preheader: "Recupere o acesso da sua conta.",
    eyebrow: "Recuperacao de senha",
    title: "Recupere o acesso da sua conta",
    greeting: `Ola, ${options.name}.`,
    intro:
      "Recebemos um pedido para redefinir sua senha e liberar um novo acesso com seguranca.",
    actionLabel: "Redefinir senha",
    actionUrl: resetUrl,
    helper:
      "Por seguranca, este link deve ser usado apenas por voce e expira automaticamente apos um curto periodo.",
    note: "Se voce nao solicitou a redefinicao, ignore esta mensagem e mantenha sua senha atual.",
  } satisfies TransactionalEmailOptions;

  try {
    await transporter.sendMail({
      from: config.from,
      replyTo: config.replyTo,
      to: options.to,
      subject: "Recuperacao de senha - Lista de Tarefas",
      text: renderTransactionalEmailText(template),
      html: renderTransactionalEmailHtml(template),
    });
  } catch (error) {
    console.error("Falha ao enviar e-mail de redefinicao.", error);
    throw new AuthError(
      AuthErrorCode.EmailDeliveryFailed,
      "Falha ao enviar e-mail de redefinicao.",
    );
  }
};

export const sendEmailVerificationEmail = async (options: {
  to: string;
  name: string;
  verifyPath: string;
}) => {
  const verifyUrl = new URL(options.verifyPath, getAppUrl()).toString();
  const { transporter, config } = createTransporter();
  const template = {
    preheader: "Confirme seu e-mail para liberar o acesso.",
    eyebrow: "Validacao de acesso",
    title: "Confirme seu e-mail",
    greeting: `Ola, ${options.name}.`,
    intro:
      "Sua conta foi criada ou solicitou um novo link de validacao. Confirme o e-mail para liberar login e acesso ao ambiente protegido.",
    actionLabel: "Confirmar e-mail",
    actionUrl: verifyUrl,
    helper:
      "Depois da confirmacao, seu login fica liberado normalmente na aplicacao.",
    note: "Se voce nao iniciou este cadastro ou nao pediu um novo link, apenas ignore esta mensagem.",
  } satisfies TransactionalEmailOptions;

  try {
    await transporter.sendMail({
      from: config.from,
      replyTo: config.replyTo,
      to: options.to,
      subject: "Confirme seu e-mail - Lista de Tarefas",
      text: renderTransactionalEmailText(template),
      html: renderTransactionalEmailHtml(template),
    });
  } catch (error) {
    console.error("Falha ao enviar e-mail de verificacao.", error);
    throw new AuthError(
      AuthErrorCode.EmailDeliveryFailed,
      "Falha ao enviar e-mail de verificacao.",
    );
  }
};
