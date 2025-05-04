import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContactDialog } from "./contact-dialog";
import type { Order } from "../types/order";

interface ShippingInfoProps {
  order: Order;
}

export function ShippingInfo({ order }: ShippingInfoProps) {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Shipping Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="font-medium">{order.shipping.name}</p>
              <p className="text-sm">{order.shipping.address.street}</p>
              <p className="text-sm">
                {order.shipping.address.city}, {order.shipping.address.state}{" "}
                {order.shipping.address.zip}
              </p>
              <p className="text-sm">{order.shipping.address.country}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Shipping Method</p>
              <p className="text-sm">{order.shipping.method}</p>
            </div>
            {order.rider && (
              <div>
                <p className="text-sm font-medium">Delivery Rider</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={order.rider.avatar} />
                    <AvatarFallback>
                      {order.rider.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{order.rider.name}</span>
                </div>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsContactDialogOpen(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Rider
            </Button>
          </div>
        </CardContent>
      </Card>

      {order.rider && (
        <ContactDialog
          open={isContactDialogOpen}
          onOpenChange={setIsContactDialogOpen}
          recipientType="rider"
          recipientName={order.rider.name}
        />
      )}
    </>
  );
} 