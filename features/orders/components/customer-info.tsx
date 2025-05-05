import { useState } from "react";
import { Mail, MessageSquare, Phone, User } from "lucide-react";

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
import type { Customer } from "../types/order";

interface CustomerInfoProps {
  customer: Customer;
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Avatar>
              <AvatarImage src={customer.avatar} />
              <AvatarFallback>
                {customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{customer.name}</p>
              <p className="text-sm text-muted-foreground">
                Customer since {customer.since}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{customer.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{customer.phone}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Orders: {customer.orderCount}</span>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsContactDialogOpen(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Customer
            </Button>
          </div>
        </CardContent>
      </Card>

      <ContactDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        recipientType="customer"
        recipientName={customer.name}
      />
    </>
  );
} 