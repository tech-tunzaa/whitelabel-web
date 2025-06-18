// Types for Delivery Management
// These mirror some definitions from ../types.ts but are scoped for delivery-specific features.

export type DeliveryStageType = 'assigned' | 'in_transit' | 'delivered' | 'failed';

export interface DeliveryStage {
  partner_id: string;
  stage: DeliveryStageType;
  timestamp: string; // ISO string
  location?: {
    lat: number;
    lng: number;
  };
}

export interface PickupPoint {
  partner_id: string;
  timestamp: string; // ISO string
}

export interface Delivery {
  _id: string;
  order_id: string;
  partner_id: string;
  pickup_points: PickupPoint[];
  stages: DeliveryStage[];
  current_stage: DeliveryStageType;
  status: 'active' | 'completed' | 'cancelled';
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  delivery_proof?: string;
  created_at: string;
  updated_at: string;
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

export interface DeliveryError {
  message: string;
  status?: number;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
