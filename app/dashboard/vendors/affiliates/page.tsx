"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { AffiliateTable } from "@/features/vendors/affiliates/components";

export default function AffiliatesPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Affiliates (Mawinga)
          </h1>
          <p className="text-muted-foreground">
            Manage marketplace affiliates
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/vendors/affiliates/add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Affiliate
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-between mb-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search affiliates..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs
          defaultValue="all"
          value={filterStatus}
          onValueChange={setFilterStatus}
        >
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All Affiliates</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value={filterStatus}>
            <AffiliateTable
              filterStatus={filterStatus === "all" ? undefined : filterStatus}
              search={searchQuery}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
