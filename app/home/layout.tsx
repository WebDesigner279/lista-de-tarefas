import { ProtectedAppShell } from "@/components/protected-app-shell";

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
