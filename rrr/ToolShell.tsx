import type { LucideIcon } from "lucide-react";

interface ToolShellProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  children: React.ReactNode;
}

export function ToolShell({ title, description, Icon, children }: ToolShellProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-center gap-4 mb-8">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-soft)]"
          style={{ background: "var(--gradient-brand)" }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-soft)]">
        {children}
      </div>
    </div>
  );
}
