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

// Role priority order (highest to lowest)
const rolePriority = ['super', 'admin', 'sub_admin', 'support'];

function getUserPrimaryRole(user: any): string | null {
  if (!user?.roles) {
    return user?.role || null; // Fallback to single role if roles array doesn't exist
  }

  // Extract role names from roles array (handle both string and object formats)
  const userRoles = user.roles.map((role: any) => 
    typeof role === 'string' ? role : role.role
  );

  // Find the highest priority role the user has
  for (const role of rolePriority) {
    if (userRoles.includes(role)) {
      return role;
    }
  }

  // If no recognized role found, return the first role or fallback
  return userRoles[0] || user?.role || null;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const primaryRole = getUserPrimaryRole(session.user);
  const DashboardComponent = primaryRole ? DashboardComponents[primaryRole as keyof typeof DashboardComponents] : null;

  if (!DashboardComponent) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">
          Dashboard not available for your role.
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
