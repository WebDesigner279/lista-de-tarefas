import Link from "next/link";
import { ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  href?: string;
  className?: string;
  titleClassName?: string;
  subtitle?: string;
  compact?: boolean;
}

export const BrandMark = ({
  href,
  className,
  titleClassName,
  subtitle,
  compact = false,
}: BrandMarkProps) => {
  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <ListTodo className="size-5" />
      </div>
      <div className="space-y-0.5">
        <span
          className={cn(
            "block font-heading text-lg font-semibold tracking-tight text-foreground",
            compact && "text-base",
            titleClassName,
          )}
        >
          Lista de Tarefas
        </span>
        {subtitle ? (
          <span className="block text-sm text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex">
      {content}
    </Link>
  );
};
