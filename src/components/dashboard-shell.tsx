"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/stores", label: "Stores" },
    { href: "/dashboard/users", label: "Users" },
    { href: "/dashboard/questions", label: "Questions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-card-border pb-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted">
            Store analytics and question management.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "button-secondary",
                  active && "border-accent bg-accent-soft text-accent",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
