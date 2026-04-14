import "server-only";

import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { AuthError, AuthErrorCode } from "@/features/auth/errors";
import {
  countUsers,
  createEmailVerificationTokenRecord,
  createPasswordResetTokenRecord,
  createSessionRecord,
  createUserRecord,
  deleteEmailVerificationTokensByUserId,
  deleteExpiredEmailVerificationTokens,
  deleteExpiredPasswordResetTokens,
  deleteExpiredSessions,
  deletePasswordResetTokensByUserId,
  deleteSessionByTokenHash,
  deleteUserSessions,
  findEmailVerificationTokenByHash,
  findPasswordResetTokenByHash,
  findSessionByTokenHash,
  findUserById,
  findUserByEmail,
  markEmailVerificationTokenAsUsed,
  markUserEmailAsVerified,
  markPasswordResetTokenAsUsed,
  updateUserName,
  updateUserPasswordHash,
} from "@/features/auth/repository";
import { SessionUser } from "@/features/auth/types";
import {
  validateEmail,
  validateEmailVerificationToken,
  validateName,
  validatePassword,
  validatePasswordForLogin,
  validatePasswordConfirmation,
  validateResetToken,
} from "@/features/auth/validators";
import {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/mailer";

const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME?.trim() || "task_session";
const SESSION_MAX_AGE_IN_SECONDS = 60 * 60 * 24 * 7;
const RESET_TOKEN_MAX_AGE_IN_MINUTES = 30;
const EMAIL_VERIFICATION_TOKEN_MAX_AGE_IN_HOURS = 24;
const PASSWORD_SALT_ROUNDS = 12;

const createTokenHash = (token: string) => {
  return createHash("sha256").update(token).digest("hex");
};

const createOpaqueToken = () => {
  return randomBytes(32).toString("hex");
};

const buildSessionUser = (user: {
  id: string;
  name: string;
  email: string;
}): SessionUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const createPasswordHash = async (password: string) => {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
};

const verifyPassword = async (password: string, passwordHash: string) => {
  return bcrypt.compare(password, passwordHash);
};

const setSessionCookie = async (token: string) => {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_IN_SECONDS,
  });
};

const clearSessionCookie = async () => {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
};

const createSessionForUser = async (user: SessionUser) => {
  const token = createOpaqueToken();
  const tokenHash = createTokenHash(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_IN_SECONDS * 1000);

  await createSessionRecord({
    userId: user.id,
    tokenHash,
    expiresAt,
  });
  await setSessionCookie(token);
};

export const getSessionCookieName = () => SESSION_COOKIE_NAME;

export const hasRegisteredUsers = async () => {
  const totalUsers = await countUsers();

  return totalUsers > 0;
};

export const getCurrentUser = async () => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const now = new Date();
  const session = await findSessionByTokenHash(createTokenHash(sessionToken));

  if (!session || session.expiresAt <= now) {
    await deleteSessionByTokenHash(createTokenHash(sessionToken));
    return null;
  }

  return buildSessionUser(session.user);
};

export const requireAuthenticatedUser = async () => {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError(AuthErrorCode.Unauthorized);
  }

  return user;
};

export const registerUser = async (input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const name = validateName(input.name);
  const email = validateEmail(input.email);
  const password = validatePassword(input.password);

  validatePasswordConfirmation(password, input.confirmPassword);

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AuthError(AuthErrorCode.EmailInUse);
  }

  const passwordHash = await createPasswordHash(password);
  const user = await createUserRecord({
    name,
    email,
    passwordHash,
  });

  await sendVerificationForUser(user.id);

  return {
    user: buildSessionUser(user),
  };
};

export const loginUser = async (input: { email: string; password: string }) => {
  const email = validateEmail(input.email);
  const password = validatePasswordForLogin(input.password);
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AuthError(AuthErrorCode.InvalidCredentials);
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AuthError(AuthErrorCode.InvalidCredentials);
  }

  if (!user.emailVerifiedAt) {
    throw new AuthError(AuthErrorCode.EmailNotVerified);
  }

  const sessionUser = buildSessionUser(user);
  await createSessionForUser(sessionUser);

  return sessionUser;
};

export const logoutUser = async () => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await deleteSessionByTokenHash(createTokenHash(sessionToken));
  }

  await clearSessionCookie();
};

export const requestPasswordReset = async (emailInput: string) => {
  try {
    const email = validateEmail(emailInput);
    const user = await findUserByEmail(email);

    await deleteExpiredSessions(new Date());
    await deleteExpiredEmailVerificationTokens(new Date());
    await deleteExpiredPasswordResetTokens(new Date());

    if (!user) {
      return {
        resetUrl: undefined,
      };
    }

    const rawToken = createOpaqueToken();
    const tokenHash = createTokenHash(rawToken);
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_MAX_AGE_IN_MINUTES * 60 * 1000,
    );

    await deletePasswordResetTokensByUserId(user.id);
    await createPasswordResetTokenRecord({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetPath = `/redefinir-acesso?token=${rawToken}`;
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetPath,
    });

    return {
      resetUrl: undefined,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    console.error("Falha inesperada ao solicitar redefinicao de senha.", error);
    throw new AuthError(
      AuthErrorCode.AuthOperationFailed,
      "Falha inesperada ao solicitar redefinicao de senha.",
    );
  }
};

export const resetPassword = async (input: {
  token: string;
  password: string;
  confirmPassword: string;
}) => {
  const token = validateResetToken(input.token);
  const password = validatePassword(input.password);

  validatePasswordConfirmation(password, input.confirmPassword);

  const passwordResetToken = await findPasswordResetTokenByHash(
    createTokenHash(token),
  );

  if (
    !passwordResetToken ||
    passwordResetToken.usedAt ||
    passwordResetToken.expiresAt <= new Date()
  ) {
    throw new AuthError(AuthErrorCode.ResetTokenInvalid);
  }

  const passwordHash = await createPasswordHash(password);

  await updateUserPasswordHash(passwordResetToken.userId, passwordHash);
  await markPasswordResetTokenAsUsed(passwordResetToken.id);
  await deleteUserSessions(passwordResetToken.userId);
  await clearSessionCookie();
};

const sendVerificationForUser = async (userId: string) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AuthError(AuthErrorCode.Unauthorized);
  }

  if (user.emailVerifiedAt) {
    return { previewUrl: undefined };
  }

  const rawToken = createOpaqueToken();
  const tokenHash = createTokenHash(rawToken);
  const expiresAt = new Date(
    Date.now() + EMAIL_VERIFICATION_TOKEN_MAX_AGE_IN_HOURS * 60 * 60 * 1000,
  );

  await deleteEmailVerificationTokensByUserId(user.id);
  await createEmailVerificationTokenRecord({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  await sendEmailVerificationEmail({
    to: user.email,
    name: user.name,
    verifyPath: `/validar-acesso?token=${rawToken}`,
  });
};

export const resendEmailVerification = async (emailInput: string) => {
  const email = validateEmail(emailInput);
  const user = await findUserByEmail(email);

  await deleteExpiredEmailVerificationTokens(new Date());

  if (!user || user.emailVerifiedAt) {
    return {
      email,
    };
  }

  await sendVerificationForUser(user.id);

  return {
    email: user.email,
  };
};

export const verifyEmailAddress = async (tokenInput: string) => {
  const token = validateEmailVerificationToken(tokenInput);
  const verificationToken = await findEmailVerificationTokenByHash(
    createTokenHash(token),
  );

  if (
    !verificationToken ||
    verificationToken.usedAt ||
    verificationToken.expiresAt <= new Date()
  ) {
    throw new AuthError(AuthErrorCode.EmailVerificationTokenInvalid);
  }

  const updatedUser = verificationToken.user.emailVerifiedAt
    ? verificationToken.user
    : await markUserEmailAsVerified(verificationToken.userId);

  await markEmailVerificationTokenAsUsed(verificationToken.id);
  const sessionUser = buildSessionUser(updatedUser);
  await createSessionForUser(sessionUser);

  return sessionUser;
};

export const updateAuthenticatedUserProfile = async (input: {
  userId: string;
  name: string;
}) => {
  const user = await findUserById(input.userId);

  if (!user) {
    throw new AuthError(AuthErrorCode.Unauthorized);
  }

  const name = validateName(input.name);
  const updatedUser = await updateUserName(user.id, name);

  return buildSessionUser(updatedUser);
};

export const changeAuthenticatedUserPassword = async (input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const user = await findUserById(input.userId);

  if (!user) {
    throw new AuthError(AuthErrorCode.Unauthorized);
  }

  const isCurrentPasswordValid = await verifyPassword(
    input.currentPassword,
    user.passwordHash,
  );

  if (!isCurrentPasswordValid) {
    throw new AuthError(AuthErrorCode.CurrentPasswordInvalid);
  }

  const newPassword = validatePassword(input.newPassword);

  validatePasswordConfirmation(newPassword, input.confirmPassword);

  const passwordHash = await createPasswordHash(newPassword);

  await updateUserPasswordHash(user.id, passwordHash);
  await deleteUserSessions(user.id);
  await createSessionForUser(buildSessionUser(user));
};
