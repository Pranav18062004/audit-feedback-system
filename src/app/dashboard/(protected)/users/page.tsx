import { AllowedUserManager } from "@/components/allowed-user-manager";
import { getAllowedUsersForDashboard } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardUsersPage() {
  const users = await getAllowedUsersForDashboard();

  return (
    <div className="space-y-6 pb-8">
      <section className="space-y-2 border-b border-card-border pb-4">
        <h2 className="text-2xl font-semibold text-foreground">Manage dashboard admins</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted sm:text-base">
          Control which Google email addresses can open the admin dashboard after signing in.
        </p>
      </section>

      <AllowedUserManager users={users} />
    </div>
  );
}
