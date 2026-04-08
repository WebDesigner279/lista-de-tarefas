import { AuthError, AuthErrorCode } from "@/features/auth/errors";

export const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 60;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_LETTER_REGEX = /[A-Za-z]/;
const PASSWORD_NUMBER_REGEX = /\d/;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const validateName = (name: string) => {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new AuthError(AuthErrorCode.NameRequired);
  }

  if (normalizedName.length > MAX_NAME_LENGTH) {
    throw new AuthError(AuthErrorCode.NameTooLong);
  }

  return normalizedName;
};

export const validateEmail = (email: string) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new AuthError(AuthErrorCode.EmailRequired);
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new AuthError(AuthErrorCode.InvalidEmail);
  }

  return normalizedEmail;
};

export const validatePassword = (password: string) => {
  if (!password) {
    throw new AuthError(AuthErrorCode.PasswordRequired);
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError(AuthErrorCode.PasswordTooShort);
  }

  if (
    !PASSWORD_LETTER_REGEX.test(password) ||
    !PASSWORD_NUMBER_REGEX.test(password)
  ) {
    throw new AuthError(AuthErrorCode.PasswordTooWeak);
  }

  return password;
};

export const validatePasswordForLogin = (password: string) => {
  if (!password) {
    throw new AuthError(AuthErrorCode.PasswordRequired);
  }

  return password;
};

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string,
) => {
  if (password !== confirmPassword) {
    throw new AuthError(AuthErrorCode.PasswordConfirmationMismatch);
  }
};

export const validateResetToken = (token: string) => {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    throw new AuthError(AuthErrorCode.ResetTokenRequired);
  }

  return normalizedToken;
};

export const validateEmailVerificationToken = (token: string) => {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    throw new AuthError(AuthErrorCode.EmailVerificationTokenRequired);
  }

  return normalizedToken;
};
