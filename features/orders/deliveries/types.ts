import { DeliveryPartner } from "@/features/delivery-partners/types";
import { Order } from "@/features/orders/types";

// Generic API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PickupPoint {
  partner_id: string;
  timestamp: string;
}

export type DeliveryStageType = 'assigned' | 'at_pickup' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';

export interface DeliveryStage {
  partner_id: string;
  stage: DeliveryStageType;
  proof: string | null;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface Delivery {
  id: string;
  tenant_id: string;
  order_id: string;
  pickup_points: PickupPoint[];
  stages: DeliveryStage[];
  current_stage: DeliveryStageType;
  estimated_delivery_time: string | null;
  actual_delivery_time: string | null;
  created_at: string;
  updated_at: string;
  // Enriched data - will be populated in the store
  order?: Order;
  deliveryPartner?: DeliveryPartner;
}

export interface DeliveryListResponse {
  items: Delivery[];
  total: number;
  skip: number;
  limit: number;
}

export interface DeliveryFilter {
  skip?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'completed' | 'cancelled';
  stage?: DeliveryStageType;
  partnerId?: string;
  orderId?: string;
}
