import prisma from "@/lib/prisma";

export const countUsers = () => {
  return prisma.user.count();
};

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findUserById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const updateUserName = (userId: string, name: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
  });
};

export const createUserRecord = (data: {
  name: string;
  email: string;
  passwordHash: string;
}) => {
  return prisma.user.create({
    data,
  });
};

export const markUserEmailAsVerified = (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      emailVerifiedAt: new Date(),
    },
  });
};

export const createSessionRecord = (data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) => {
  return prisma.session.create({
    data,
  });
};

export const findSessionByTokenHash = (tokenHash: string) => {
  return prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: true,
    },
  });
};

export const deleteSessionByTokenHash = (tokenHash: string) => {
  return prisma.session.deleteMany({
    where: { tokenHash },
  });
};

export const deleteUserSessions = (userId: string) => {
  return prisma.session.deleteMany({
    where: { userId },
  });
};

export const deleteExpiredSessions = (now: Date) => {
  return prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });
};

export const createEmailVerificationTokenRecord = (data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) => {
  return prisma.emailVerificationToken.create({
    data,
  });
};

export const findEmailVerificationTokenByHash = (tokenHash: string) => {
  return prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: {
      user: true,
    },
  });
};

export const markEmailVerificationTokenAsUsed = (id: string) => {
  return prisma.emailVerificationToken.update({
    where: { id },
    data: {
      usedAt: new Date(),
    },
  });
};

export const deleteEmailVerificationTokensByUserId = (userId: string) => {
  return prisma.emailVerificationToken.deleteMany({
    where: { userId },
  });
};

export const deleteExpiredEmailVerificationTokens = (now: Date) => {
  return prisma.emailVerificationToken.deleteMany({
    where: {
      OR: [
        {
          expiresAt: {
            lt: now,
          },
        },
        {
          usedAt: {
            not: null,
          },
        },
      ],
    },
  });
};

export const createPasswordResetTokenRecord = (data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) => {
  return prisma.passwordResetToken.create({
    data,
  });
};

export const findPasswordResetTokenByHash = (tokenHash: string) => {
  return prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: true,
    },
  });
};

export const markPasswordResetTokenAsUsed = (id: string) => {
  return prisma.passwordResetToken.update({
    where: { id },
    data: {
      usedAt: new Date(),
    },
  });
};

export const deletePasswordResetTokensByUserId = (userId: string) => {
  return prisma.passwordResetToken.deleteMany({
    where: { userId },
  });
};

export const deleteExpiredPasswordResetTokens = (now: Date) => {
  return prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        {
          expiresAt: {
            lt: now,
          },
        },
        {
          usedAt: {
            not: null,
          },
        },
      ],
    },
  });
};

export const updateUserPasswordHash = (
  userId: string,
  passwordHash: string,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
};
