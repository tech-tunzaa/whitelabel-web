export interface DocumentType {
  document_type_id: string;
  tenant_id: string;
  name: string;
  description: string;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_required: boolean;
}

export interface VehicleType {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  tenant_id?: string;
}

export interface TenantVehicleType extends VehicleType {
  tenant_id: string;
}

export interface EntityConfiguration {
  entity_id: string;
  tenant_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  document_types: DocumentType[];
}
