import { config as loadEnv } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

loadEnv({ path: ".env.local", override: false });
loadEnv({ override: false });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL nao configurada.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const demoUserEmail =
  process.env.DEMO_USER_EMAIL?.trim() || "demo@listadetarefas.local";
const demoUserPassword = process.env.DEMO_USER_PASSWORD?.trim() || "Demo1234";
const demoUserName = process.env.DEMO_USER_NAME?.trim() || "Usuario Demo";
const taskNames = ["Planejar sprint", "Revisar backlog", "Responder e-mails"];

const main = async () => {
  const passwordHash = await bcrypt.hash(demoUserPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: demoUserEmail },
    update: {
      emailVerifiedAt: new Date(),
      name: demoUserName,
      passwordHash,
    },
    create: {
      emailVerifiedAt: new Date(),
      name: demoUserName,
      email: demoUserEmail,
      passwordHash,
    },
  });

  for (const taskName of taskNames) {
    const existingTask = await prisma.tasks.findFirst({
      where: {
        userId: user.id,
        task: {
          equals: taskName,
          mode: "insensitive",
        },
      },
    });

    if (!existingTask) {
      await prisma.tasks.create({
        data: {
          task: taskName,
          done: false,
          userId: user.id,
        },
      });
    }
  }

  console.info("Seed concluido.");
  console.info(`Email demo: ${demoUserEmail}`);
  console.info(`Senha demo: ${demoUserPassword}`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
