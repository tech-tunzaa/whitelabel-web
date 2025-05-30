"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import { ErrorCard } from "@/components/ui/error-card";

import { RewardsDashboardContent } from "@/features/rewards/components/rewards-dashboard-content";
import { useRewardsStore } from "@/features/rewards/store";

export default function RewardsPage() {
  const session = useSession();
  const tenantId = session?.data?.user ? (session.data.user as any).tenant_id : undefined;
  const { storeError } = useRewardsStore();
  
  // Added local loading state that doesn't depend on the store
  const [isLoading, setIsLoading] = useState(true);
  
  // Force the page to render after a timeout to avoid infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Short timeout to ensure the page renders
    
    return () => clearTimeout(timer);
  }, []);

  // Define tenant headers for future API integration
  const tenantHeaders = {
    "X-Tenant-ID": tenantId
  };

  // If there's an error, show the error card
  if (storeError) {
    return (
      <div className="container py-10">
        <ErrorCard 
          title="Error loading rewards data" 
          error={{ status: '500', message: storeError.message }}
          buttonText="Retry"
          buttonAction={() => window.location.reload()}
          buttonIcon={(props) => <svg xmlns="http://www.w3.org/2000/svg" {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>}
        />
      </div>
    );
  }

  // Show loading spinner briefly
  if (isLoading) {
    return (
      <Spinner />
    );
  }

  return (
    <div className="container py-6">
      <RewardsDashboardContent />
    </div>
  );
}
