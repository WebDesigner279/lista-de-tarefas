export enum AuthErrorCode {
  Unauthorized = "UNAUTHORIZED",
  InvalidCredentials = "INVALID_CREDENTIALS",
  CurrentPasswordInvalid = "CURRENT_PASSWORD_INVALID",
  EmailNotVerified = "EMAIL_NOT_VERIFIED",
  EmailDeliveryUnavailable = "EMAIL_DELIVERY_UNAVAILABLE",
  EmailDeliveryFailed = "EMAIL_DELIVERY_FAILED",
  AuthOperationFailed = "AUTH_OPERATION_FAILED",
  EmailInUse = "EMAIL_IN_USE",
  NameRequired = "NAME_REQUIRED",
  NameTooLong = "NAME_TOO_LONG",
  EmailRequired = "EMAIL_REQUIRED",
  InvalidEmail = "INVALID_EMAIL",
  PasswordRequired = "PASSWORD_REQUIRED",
  PasswordTooShort = "PASSWORD_TOO_SHORT",
  PasswordTooWeak = "PASSWORD_TOO_WEAK",
  PasswordConfirmationMismatch = "PASSWORD_CONFIRMATION_MISMATCH",
  EmailVerificationTokenRequired = "EMAIL_VERIFICATION_TOKEN_REQUIRED",
  EmailVerificationTokenInvalid = "EMAIL_VERIFICATION_TOKEN_INVALID",
  ResetTokenRequired = "RESET_TOKEN_REQUIRED",
  ResetTokenInvalid = "RESET_TOKEN_INVALID",
}

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code);
    this.name = "AuthError";
    this.code = code;
  }
}

export const isAuthError = (
  error: unknown,
  code?: AuthErrorCode,
): error is AuthError => {
  if (!(error instanceof AuthError)) {
    return false;
  }

  if (!code) {
    return true;
  }

  return error.code === code;
};
