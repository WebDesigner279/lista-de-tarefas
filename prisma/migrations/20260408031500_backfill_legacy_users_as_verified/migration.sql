UPDATE "User"
SET "emailVerifiedAt" = "createdAt"
WHERE "emailVerifiedAt" IS NULL
  AND "createdAt" < TIMESTAMPTZ '2026-04-08T02:20:46.000Z';
