import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdminUser } from "@/lib/access";
import { requireDashboardSession } from "@/lib/dashboard-auth";

export default async function ProtectedDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdminUser("/dashboard");
  await requireDashboardSession();

  return <DashboardShell>{children}</DashboardShell>;
}
