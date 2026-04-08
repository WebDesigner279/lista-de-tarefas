import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/app-navbar";
import { getCurrentUser } from "@/lib/auth";

interface ProtectedAppShellProps {
  children: React.ReactNode;
}

export const ProtectedAppShell = async ({
  children,
}: ProtectedAppShellProps) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f3f6fb_35%,#f8fafc_100%)]">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.15),transparent_40%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_34%)]" />
      <div className="relative">
        <AppNavbar user={user} />
        {children}
      </div>
    </div>
  );
};
