"use server";

import { AuthErrorCode, isAuthError } from "@/features/auth/errors";
import { AuthActionResult } from "@/features/auth/types";
import {
  changeAuthenticatedUserPassword,
  loginUser,
  logoutUser,
  registerUser,
  resendEmailVerification,
  requestPasswordReset,
  resetPassword,
  requireAuthenticatedUser,
  updateAuthenticatedUserProfile,
  verifyEmailAddress,
} from "@/lib/auth";
import { sendSmtpTestEmail, verifySmtpConnection } from "@/lib/mailer";

const authErrorMessages: Record<AuthErrorCode, string> = {
  [AuthErrorCode.Unauthorized]: "Sua sessao nao e valida. Entre novamente.",
  [AuthErrorCode.InvalidCredentials]: "E-mail ou senha invalidos.",
  [AuthErrorCode.CurrentPasswordInvalid]: "A senha atual nao confere.",
  [AuthErrorCode.EmailNotVerified]:
    "Seu e-mail ainda nao foi confirmado. Valide o acesso antes de entrar.",
  [AuthErrorCode.EmailDeliveryUnavailable]:
    "O envio de e-mails nao esta configurado no ambiente. Defina as variaveis SMTP antes de usar autenticacao por e-mail.",
  [AuthErrorCode.EmailDeliveryFailed]:
    "Nao foi possivel enviar o e-mail agora. Revise a configuracao SMTP e tente novamente.",
  [AuthErrorCode.AuthOperationFailed]:
    "Nao foi possivel concluir a operacao agora.",
  [AuthErrorCode.EmailInUse]: "Ja existe uma conta com esse e-mail.",
  [AuthErrorCode.NameRequired]: "Informe seu nome.",
  [AuthErrorCode.NameTooLong]: "Seu nome e muito longo.",
  [AuthErrorCode.EmailRequired]: "Informe seu e-mail.",
  [AuthErrorCode.InvalidEmail]: "Informe um e-mail valido.",
  [AuthErrorCode.PasswordRequired]: "Informe sua senha.",
  [AuthErrorCode.PasswordTooShort]:
    "A senha precisa ter pelo menos 8 caracteres.",
  [AuthErrorCode.PasswordTooWeak]: "A senha precisa combinar letras e numeros.",
  [AuthErrorCode.PasswordConfirmationMismatch]:
    "A confirmacao da senha nao confere.",
  [AuthErrorCode.EmailVerificationTokenRequired]:
    "O link de validacao nao e valido.",
  [AuthErrorCode.EmailVerificationTokenInvalid]:
    "O link de validacao expirou ou ja foi usado.",
  [AuthErrorCode.ResetTokenRequired]: "O link de redefinicao nao e valido.",
  [AuthErrorCode.ResetTokenInvalid]:
    "O link de redefinicao expirou ou ja foi usado.",
};

const buildErrorResult = (error: unknown): AuthActionResult => {
  if (isAuthError(error)) {
    return {
      status: "error",
      message: authErrorMessages[error.code],
    };
  }

  console.error("Erro inesperado na autenticacao", error);

  return {
    status: "error",
    message: "Nao foi possivel concluir a operacao agora.",
  };
};

export const loginAction = async (input: {
  email: string;
  password: string;
}): Promise<AuthActionResult> => {
  try {
    await loginUser(input);

    return {
      status: "success",
      redirectTo: "/dashboard",
    };
  } catch (error) {
    return buildErrorResult(error);
  }
};

export const registerAction = async (input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthActionResult> => {
  try {
    const result = await registerUser(input);

    return {
      status: "success",
      redirectTo: `/validar-acesso?email=${encodeURIComponent(result.user.email)}`,
      email: result.user.email,
    };
  } catch (error) {
    return buildErrorResult(error);
  }
};

export const logoutAction = async (): Promise<AuthActionResult> => {
  try {
    await logoutUser();

    return {
      status: "success",
      redirectTo: "/login",
    };
  } catch (error) {
    return buildErrorResult(error);
  }
};

export const requestPasswordResetAction = async (
  email: string,
): Promise<AuthActionResult> => {
  try {
    await requestPasswordReset(email);

    return {
      status: "success",
      message:
        "Se o e-mail estiver cadastrado, enviamos as instrucoes de redefinicao.",
    };
  } catch (error) {
    return buildErrorResult(error);
  }
};

export const resetPasswordAction = async (input: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthActionResult> => {
  try {
    await resetPassword(input);

    return {
      status: "success",
      message: "Senha atualizada com sucesso. Entre com a nova senha.",
      redirectTo: "/login",
    };
  } catch (error) {
    return buildErrorResult(error);
  }
};

export const updateProfileAction = async (input: {
  name: string;
}): Promise<AuthActionResult> => {
  try {
    const user = await requireAuthenticatedUser();
    await updateAuthenticatedUserProfile({
      userId: user.id,
      name: input.name,
    });

    return {
      status: "success",
      message: "Perfil atualizado com sucesso.",
    };
  } catch (error) {
    return buildErrorResult(error);
  }
};

export const changePasswordAction = async (input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<AuthActionResult> => {
  try {
    const user = await requireAuthenticatedUser();

    await changeAuthenticatedUserPassword({
      userId: user.id,
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      confirmPassword: input.confirmPassword,
    });

    return {
      status: "success",
      message: "Senha atualizada com sucesso.",
    };
  } catch (error) {
    return buildErrorResult(error);
  }
};

export const resendEmailVerificationAction = async (
  email: string,
): Promise<AuthActionResult> => {
  try {
    const result = await resendEmailVerification(email);

    return {
      status: "success",
      message:
        "Se existir uma conta pendente para esse e-mail, enviamos um novo link de validacao.",
      email: result.email,
    };
  } catch (error) {
    return buildErrorResult(error);
  }
};

export const verifyEmailAction = async (
  token: string,
): Promise<AuthActionResult> => {
  try {
    await verifyEmailAddress(token);

    return {
      status: "success",
      message: "E-mail confirmado com sucesso.",
      redirectTo: "/dashboard",
    };
  } catch (error) {
    return buildErrorResult(error);
  }
};

export const testSmtpDeliveryAction = async (): Promise<AuthActionResult> => {
  try {
    const user = await requireAuthenticatedUser();
    const connection = await verifySmtpConnection();
    const delivery = await sendSmtpTestEmail({
      to: user.email,
      name: user.name,
    });

    return {
      status: "success",
      message: "E-mail de teste enviado com sucesso.",
      details: `Servidor ${connection.host}:${connection.port} (${connection.secure ? "SSL/TLS" : "STARTTLS/PLAIN"}) usando remetente ${delivery.from}.`,
    };
  } catch (error) {
    return buildErrorResult(error);
  }
};
