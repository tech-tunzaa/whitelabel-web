import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Payment } from "../types/order";

interface PaymentInfoProps {
  payment: Payment;
}

export function PaymentInfo({ payment }: PaymentInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Payment Method</p>
            <p className="text-sm">{payment.method}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Payment Status</p>
            <Badge variant={payment.status === "paid" ? "success" : "warning"}>
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </Badge>
          </div>
          {payment.transactionId && (
            <div>
              <p className="text-sm font-medium">Transaction ID</p>
              <p className="text-sm font-mono">{payment.transactionId}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 