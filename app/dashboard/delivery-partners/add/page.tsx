"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDeliveryPartnerStore } from "@/features/delivery-partners/store"
import { DeliveryPartnerForm } from "@/features/delivery-partners/components/delivery-partner-form"
import { DeliveryPartner } from "@/features/delivery-partners/types"
import toast from "@/components/ui/sonner";

export default function CreateDeliveryPartnerPage() {
    const router = useRouter()
    const { data: session } = useSession();

    const { createDeliveryPartner } = useDeliveryPartnerStore()

    const handleSubmit = async (data: any) => {
        const tenantId = (session?.user as any)?.tenant_id;
        const headers: Record<string, string> = {};
        if (tenantId) {
          headers["X-Tenant-ID"] = tenantId;
        }

        try {
            await createDeliveryPartner(data, headers);
            toast.success("Delivery Partner created successfully");
            router.push("/dashboard/delivery-partners");
        } catch (error) {
            console.error("Error creating delivery partner:", error);
            toast.error("Failed to create delivery partner. Please try again.");
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/dashboard/delivery-partners")}
                    className="mr-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add Delivery Partner</h1>
                    <p className="text-muted-foreground">
                        Create a new delivery partner account
                    </p>
                </div>
            </div>

            <div className="p-4">
                <DeliveryPartnerForm
                    onSubmit={handleSubmit}
                    onCancel={() => router.push("/dashboard/delivery-partners")}
                />
            </div>
        </div>
    )
} 