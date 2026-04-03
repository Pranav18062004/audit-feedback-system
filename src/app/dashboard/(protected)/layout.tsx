import { DashboardShell } from "@/components/dashboard-shell";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export default async function ProtectedDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireDashboardSession();

  return <DashboardShell>{children}</DashboardShell>;
}
