"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";
import { AffiliateForm } from "@/features/affiliates/components";
import { useAffiliateStore } from "@/features/affiliates/store";
import { toast } from "sonner";

interface EditAffiliatePageProps {
  params: { id: string };
}

export default function EditAffiliatePage({ params }: EditAffiliatePageProps) {
  const { id } = params;
  const router = useRouter();
  const { affiliate, loading, storeError, fetchAffiliate } =
    useAffiliateStore();
  const [fetchAttempted, setFetchAttempted] = useState(false);

  console.log(
    "[EditAffiliatePage] Render. ID:",
    id,
    "Loading:",
    loading,
    "Affiliate ID:",
    affiliate?.id,
    "Fetch Attempted:",
    fetchAttempted,
    "StoreError:",
    storeError?.message
  );

  useEffect(() => {
    console.log(
      "[EditAffiliatePage] useEffect. ID:",
      id,
      "Fetch Attempted:",
      fetchAttempted
    );
    if (id && !fetchAttempted) {
      setFetchAttempted(true);
      console.log("[EditAffiliatePage] Calling fetchAffiliate for ID:", id);
      fetchAffiliate(id).catch((error) => {
        // Error handling is already in the store, toast can be here or based on storeError in render
        console.error("Fetch affiliate from useEffect failed:", error);
        // Potentially router.push or toast here if fetchAffiliate itself doesn't handle all UI feedback for critical errors
      });
    }
  }, [id, fetchAffiliate, fetchAttempted, router]); // Added fetchAttempted, removed loading, affiliate, storeError

  if (loading) {
    return <Spinner />;
  }

  if (fetchAttempted && !loading && !affiliate && storeError) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Vendor Affiliate
            </h1>
            <p className="text-muted-foreground">
              Update information for an existing affiliate
            </p>
          </div>
        </div>

        <div className="p-4">
          <ErrorCard
            title="Failed to load affiliate details"
            error={{
              status: storeError?.status?.toString() || "Error",
              message: storeError?.message || "An error occurred",
            }}
            buttonText="Back to Affiliates"
            buttonAction={() => router.push("/dashboard/affiliates")}
            buttonIcon={ArrowLeft}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit Vendor Affiliate
          </h1>
          <p className="text-muted-foreground">
            Update information for an existing affiliate
          </p>
        </div>
      </div>

      <div className="p-4">
        {/* <AffiliateForm affiliateId={id} initialData={affiliate} /> */}
      </div>
    </div>
  );
}
