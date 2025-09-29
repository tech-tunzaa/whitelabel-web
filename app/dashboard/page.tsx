import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SuperOwnerDashboard } from "@/features/dashboard/components/super-owner/super-owner-dashboard";
import { AdminDashboard } from "@/features/dashboard/components/admin/admin-dashboard";
import { SubAdminDashboard } from "@/features/dashboard/components/sub-admin/sub-admin-dashboard";
import { SupportDashboard } from "@/features/dashboard/components/support/support-dashboard";

export const metadata = {
  title: "Marketplace Dashboard",
};

const DashboardComponents = {
  super: SuperOwnerDashboard,
  admin: AdminDashboard,
  sub_admin: SubAdminDashboard,
  support: SupportDashboard,
} as const;

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const DashboardComponent = DashboardComponents[session.user.role];

  if (!DashboardComponent) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">
          No dashboard available for your role.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col">
        <DashboardComponent />
      </div>
    </div>
  );
}
