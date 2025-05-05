import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import type { Order } from "../types/order";

interface OrderItemsProps {
  order: Order;
}

export function OrderItems({ order }: OrderItemsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "Tzs",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start space-x-4">
            <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.quantity} × {formatCurrency(item.price)}
              </p>
              {item.options && (
                <div className="text-xs text-muted-foreground mt-1">
                  {Object.entries(item.options).map(([key, value]) => (
                    <span key={key} className="mr-2">
                      {key}: {value}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{formatCurrency(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="mt-4">Total</span>
            <span>
              <Separator className="my-2" />
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 