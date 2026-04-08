"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { SessionUser } from "@/features/auth/types";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tarefas",
    href: "/home",
    icon: ListTodo,
  },
  {
    label: "Perfil",
    href: "/perfil",
    icon: UserRound,
  },
  {
    label: "Configuracoes",
    href: "/configuracoes",
    icon: Settings,
  },
] as const;

interface AppNavbarProps {
  user: SessionUser;
}

export const AppNavbar = ({ user }: AppNavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logoutAction();

      if (result.redirectTo) {
        router.replace(result.redirectTo);
        router.refresh();
      }
    });
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <BrandMark
            href="/dashboard"
            subtitle="Seu painel pessoal e seguro"
            compact
            className="gap-2.5"
            titleClassName="text-base sm:text-lg"
          />

          <div className="hidden items-center gap-3 md:flex">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}

            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-2 text-sm shadow-sm">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="size-4" />
              </div>
              <div className="leading-tight">
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={handleLogout}
              disabled={isPending}
            >
              <LogOut />
              Sair
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label="Abrir navegacao"
          >
            {isMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </nav>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-slate-950/45 transition-opacity duration-200 md:hidden",
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeMenu}
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-80 max-w-[88vw] flex-col border-l border-border bg-background p-6 shadow-2xl transition-transform duration-200 md:hidden",
          isMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <BrandMark
            compact
            subtitle="Conta conectada"
            className="items-start"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={closeMenu}
            aria-label="Fechar navegacao"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button
          type="button"
          variant="outline"
          className="mt-6 w-full cursor-pointer justify-center"
          onClick={handleLogout}
          disabled={isPending}
        >
          <LogOut />
          Sair da conta
        </Button>
      </aside>
    </>
  );
};
