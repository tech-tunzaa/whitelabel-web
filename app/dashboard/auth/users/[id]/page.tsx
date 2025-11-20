"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/features/auth/stores/user-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Edit, Trash2, Mail, Phone, CalendarDays, ShieldCheck, Clock, LogIn, Power, Key, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ErrorCard } from "@/components/ui/error-card";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PasswordResetDialog } from "@/features/auth/components/password-reset-dialog";

interface UserPageProps {
  params: {
    id: string;
  };
}

const getInitials = (name: string) => {
  if (!name) return "";
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.toUpperCase();
};

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
      <Icon className="h-4 w-4" /> {label}
    </p>
    <p className="text-sm">{value}</p>
  </div>
);

const UserPage = ({ params }: UserPageProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const tenantId = session?.user?.tenant_id;

  const {
    user,
    loading,
    error,
    fetchUser,
    deleteUser,
    updateUser,
  } = useUserStore();

  const [isDeleting, setIsDeleting] = useState(false);

  const headers = {
    "X-Tenant-ID": tenantId,
  };

  useEffect(() => {
    if (params.id && tenantId) {
      fetchUser(params.id, headers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, tenantId]);

  const handleGoBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/dashboard/auth/users/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (!tenantId) {
      toast.error("Tenant ID is missing.");
      return;
    }
    setIsDeleting(true);
    try {
      await deleteUser(params.id, headers);
      toast.success("User deleted successfully.");
      router.push("/dashboard/auth/users");
    } catch (err) {
      toast.error("Failed to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user || !tenantId) {
      toast.error("User data or Tenant ID is missing.");
      return;
    }
    const newStatus = !user.is_active;
    try {
      await updateUser(params.id, { is_active: newStatus, is_verified: newStatus }, headers);
      toast.success(`User has been ${newStatus ? "activated" : "deactivated"}.`);
      fetchUser(params.id, headers); // Re-fetch user to update UI
    } catch (err) {
      toast.error("Failed to update user status.");
    }
  };

  if (loading) {
    return (
      <Spinner />
    );
  }

  if (error || !user) {
    return (
      <ErrorCard
        title="Failed to load user"
        error={error}
        buttonText="Go back to Users"
        buttonAction={() => fetchUser(params.id, headers)}
        buttonIcon={ArrowLeft}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleGoBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar || ""} alt={user.first_name} />
              <AvatarFallback>{getInitials(`${user.first_name} ${user.last_name}`)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{`${user.first_name} ${user.last_name}`}</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <User className="h-3 w-3" />
                User ID: {user.user_id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={user.is_active ? "default" : "destructive"} className={cn(user.is_active ? "bg-green-500 hover:bg-green-600" : "")}>
            {user.is_active ? "Active" : "Inactive"}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        </div>
      </div>

      <Separator />
      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 md:p-6 gap-6 flex-1">
        {/* Main Content - 2 columns */}
        <div className="md:col-span-2 space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Core details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem icon={Mail} label="Email" value={<a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a>} />
              <InfoItem icon={Phone} label="Phone Number" value={user.phone_number ? <a href={`tel:${user.phone_number}`} className="hover:underline">{user.phone_number}</a> : "N/A"} />
              <InfoItem icon={CalendarDays} label="Joined Date" value={format(new Date(user.created_at), "PPP")} />
              <InfoItem icon={Clock} label="Last Login" value={user.last_login ? format(new Date(user.last_login), "PPP p") : "Never"} />
              <InfoItem icon={ShieldCheck} label="Email Verified" value={user.is_verified ? "Yes" : "No"} />
              <InfoItem icon={LogIn} label="Login Provider" value={user.provider || "N/A"} />
            </CardContent>
          </Card>

          {/* Roles & Profiles Card */}
          <Card>
            <CardHeader>
              <CardTitle>Roles and Profiles</CardTitle>
              <CardDescription>Assigned roles and active profiles for the user.</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-md mb-2">Active Profile Role</h3>
              <Badge variant="secondary">{user.active_profile_role}</Badge>

              <Separator className="my-4" />

              <h3 className="font-semibold text-md mb-2">All Assigned Roles</h3>
              <div className="flex flex-wrap gap-2">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <Badge key={role.role} variant="outline">{role.description}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No roles assigned.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="md:col-span-1 space-y-6">
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h4 className="font-semibold">User Status</h4>
                <p className="text-sm text-muted-foreground">The user is currently {user.is_active ? "Active" : "Inactive"}.</p>
                <Button onClick={handleToggleStatus} variant="secondary" size="sm" className="w-full">
                  <Power className="mr-2 h-4 w-4" /> {user.is_active ? "Deactivate" : "Activate"} User
                </Button>
              </div>

              <Separator />

              <div className="flex flex-col space-y-2">
                <h4 className="font-semibold">Password Management</h4>
                <p className="text-sm text-muted-foreground">Reset the user's password.</p>
                <PasswordResetDialog
                  userId={params.id}
                  userEmail={user.email}
                  userPhone={user.phone_number}
                  tenantId={tenantId}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserPage;