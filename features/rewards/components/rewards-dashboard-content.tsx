import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RewardsSettingsForm } from "./settings-form";
import { ReferralsOverview } from "./referrals-overview";
import { RedemptionReport } from "./redemption-report";
import { useRewardsStore } from "../store";

export function RewardsDashboardContent() {
  // Remove dependency on the store's fetchConfig method
  // We'll let individual tab components handle their own data fetching
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-tight">Rewards & Referrals</h2>
          <p className="text-muted-foreground">Manage rewards and referrals for marketplace</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-9">
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>
      <Separator />
      
      <Tabs defaultValue="settings" className="space-y-4 px-6">
        <TabsList className="w-full pb-0 mb-4">
          <TabsTrigger value="settings">
            Settings
          </TabsTrigger>
          <TabsTrigger value="referrals">
            Referrals
          </TabsTrigger>
          <TabsTrigger value="redemptions">
            Redemptions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-4 mt-4">
          <RewardsSettingsForm />
        </TabsContent>
        
        <TabsContent value="referrals" className="space-y-4 mt-4">
          <ReferralsOverview />
        </TabsContent>
        
        <TabsContent value="redemptions" className="space-y-4 mt-4">
          <RedemptionReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
