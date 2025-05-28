"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { WingaForm } from "@/features/vendors/winga/components";
import { useWingaStore } from "@/features/vendors/winga/store";
import { toast } from "sonner";

interface EditWingaPageProps {
  params: { id: string };
}

export default function EditWingaPage({ params }: EditWingaPageProps) {
  const { id } = params;
  const router = useRouter();
  const { winga, loading, storeError, fetchWinga } = useWingaStore();

  useEffect(() => {
    if (id) {
      fetchWinga(id).catch((error) => {
        console.error("Error fetching winga:", error);
        toast.error("Failed to load affiliate details");
        router.push("/dashboard/vendors/winga");
      });
    }
  }, [id, fetchWinga, router]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Vendor Affiliate</h1>
            <p className="text-muted-foreground">
              Update information for an existing affiliate
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!winga && storeError) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Vendor Affiliate</h1>
            <p className="text-muted-foreground">
              Update information for an existing affiliate
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="p-4">
          <ErrorCard
            title="Failed to load affiliate details"
            error={{
              status: storeError?.status?.toString() || "Error",
              message: storeError?.message || "An error occurred"
            }}
            buttonText="Retry"
            buttonAction={() => fetchWinga(id)}
            buttonIcon={RefreshCw}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Vendor Affiliate</h1>
          <p className="text-muted-foreground">
            Update information for an existing affiliate
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="p-4">
        <WingaForm wingaId={id} initialData={winga} />
      </div>
    </div>
  );
}
