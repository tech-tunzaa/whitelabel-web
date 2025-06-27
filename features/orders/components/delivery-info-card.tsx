import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Order, DeliveryDetails } from '@/features/orders/types';
import { Truck, CheckCircle, XCircle, Clock, Package, Warehouse } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AssignDeliveryPartnerDialog } from './assign-delivery-partner-dialog';
import { useOrderStore } from '../store';

interface DeliveryInfoCardProps {
  order: Order | null;
  delivery_details: DeliveryDetails | null;
}

const stageIcons: { [key: string]: React.ElementType } = {
  pending: Package,
  processing: Warehouse,
  assigned: Clock,
  out_for_delivery: Truck,
  in_transit: Truck,
  delivered: CheckCircle,
  failed: XCircle,
  default: Clock,
};

export const DeliveryInfoCard: React.FC<DeliveryInfoCardProps> = ({ order, delivery_details }) => {
  const { data: session } = useSession();
  const { fetchOrder } = useOrderStore();
  const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);

  const handleAssignmentSuccess = () => {
    if (order && session) {
      const tenantId = (session.user as any)?.tenant_id;
      fetchOrder(order.order_id, { 'X-Tenant-ID': tenantId });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Delivery</CardTitle>
            {delivery_details && (
              <Badge variant="secondary">{delivery_details.current_stage}</Badge>
            )}
          </div>
          <CardDescription>
            {delivery_details ? 'Tracking information and history.' : 'No delivery information available.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {delivery_details && delivery_details.stages.length > 0 ? (
            <div>
              <div className="space-y-6">
                {delivery_details.stages.map((stage, index) => {
                  const Icon = stageIcons[stage.stage] || stageIcons.default;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                        {index < delivery_details.stages.length - 1 && (
                          <div className="h-8 w-px bg-border my-1" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold capitalize">
                          {stage.stage.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(stage.timestamp)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Partner: {stage.partner_id}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button className="w-full mt-6" disabled>
                Update Delivery Status
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Delivery has not been initiated for this order.
              </p>
              <Button className="mt-4" onClick={() => setAssignDialogOpen(true)}>
                Assign Delivery Partner
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {order && (
        <AssignDeliveryPartnerDialog
          orderId={order.order_id}
          isOpen={isAssignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          onAssignmentSuccess={handleAssignmentSuccess}
        />
      )}
    </>
  );
};
