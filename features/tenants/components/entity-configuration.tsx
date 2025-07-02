import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, AlertCircle, Car, FileText } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { DOCUMENT_TYPES } from '@/features/settings/data/document-types';
import { VEHICLE_TYPES } from '@/features/settings/data/vehicle_types';

interface DocumentTypeConfig {
  document_type_id: string;
  is_required: boolean;
  description?: string;
}

interface VehicleTypeConfig {
  vehicle_type_id: string;
  is_active: boolean;
  description?: string;
}

interface EntityDocumentConfig {
  entity_type: 'delivery' | 'vendor' | 'affiliate';
  document_types: DocumentTypeConfig[];
  vehicle_types?: VehicleTypeConfig[];
}

interface TenantConfigurationProps {
  tenantId?: string;
  initialConfig?: Record<string, EntityDocumentConfig>;
  onConfigChange?: (config: Record<string, EntityDocumentConfig>) => void;
  isEditable?: boolean;
}

export function TenantConfiguration({
  tenantId,
  initialConfig,
  onConfigChange,
  isEditable = true,
}: TenantConfigurationProps) {
  const [activeTab, setActiveTab] = useState<'delivery' | 'vendor' | 'affiliate'>('delivery');
  const [activeSubTab, setActiveSubTab] = useState<'documents' | 'vehicles'>('documents');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize config with default values if not provided
  const defaultConfig: Record<string, EntityDocumentConfig> = {
    delivery: {
      entity_type: 'delivery',
      document_types: [],
    },
    vendor: {
      entity_type: 'vendor',
      document_types: [],
    },
    affiliate: {
      entity_type: 'affiliate',
      document_types: [],
    },
    vehicle_type: [],
  };

  const [config, setConfig] = useState<Record<string, EntityDocumentConfig>>(
    initialConfig || defaultConfig
  );

  // Add a document type to the current entity
  const addDocumentType = (entityType: 'delivery' | 'vendor' | 'affiliate') => {
    const updatedConfig = { ...config };
    updatedConfig[entityType].document_types.push({
      document_type_id: '',
      is_required: false,
      description: '',
    });
    setConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  // Remove a document type from the current entity
  const removeDocumentType = (entityType: 'delivery' | 'vendor' | 'affiliate', index: number) => {
    const updatedConfig = { ...config };
    updatedConfig[entityType].document_types.splice(index, 1);
    setConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  // Update a document type configuration
  const updateDocumentType = (
    entityType: 'delivery' | 'vendor' | 'affiliate',
    index: number,
    field: 'document_type_id' | 'is_required' | 'description',
    value: string | boolean
  ) => {
    const updatedConfig = { ...config };
    if (field === 'document_type_id') {
      const doc = DOCUMENT_TYPES.find(dt => dt.slug === value);
      updatedConfig[entityType].document_types[index].document_type_id = value as string;
      updatedConfig[entityType].document_types[index].description = doc?.description || '';
    } else {
      updatedConfig[entityType].document_types[index][field] = value as any;
    }
    setConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  // Add a vehicle type to the current entity
  const addVehicleType = (entityType: 'delivery' | 'vendor' | 'affiliate') => {
    if (entityType !== 'delivery') return;
    const updatedConfig = { ...config };
    if (!updatedConfig[entityType].vehicle_types) {
      updatedConfig[entityType].vehicle_types = [];
    }
    updatedConfig[entityType].vehicle_types!.push({
      vehicle_type_id: '',
      is_active: true,
      description: '',
    });
    setConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  // Remove a vehicle type from the current entity
  const removeVehicleType = (entityType: 'delivery' | 'vendor' | 'affiliate', index: number) => {
    // Only allow vehicle types for delivery partners
    if (entityType !== 'delivery') {
      return;
    }
    
    const updatedConfig = { ...config };
    if (updatedConfig[entityType].vehicle_types) {
      updatedConfig[entityType].vehicle_types!.splice(index, 1);
      setConfig(updatedConfig);
      onConfigChange?.(updatedConfig);
    }
  };

  // Update a vehicle type configuration
  const updateVehicleType = (
    entityType: 'delivery' | 'vendor' | 'affiliate',
    index: number,
    field: 'vehicle_type_id' | 'is_active' | 'description',
    value: string | boolean
  ) => {
    if (entityType !== 'delivery') return;
    const updatedConfig = { ...config };
    if (field === 'vehicle_type_id') {
      const vt = VEHICLE_TYPES.find(v => v.slug === value);
      updatedConfig[entityType].vehicle_types![index].vehicle_type_id = value as string;
      updatedConfig[entityType].vehicle_types![index].description = vt?.description || '';
    } else {
      updatedConfig[entityType].vehicle_types![index][field] = value as any;
    }
    setConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  // Get document type name and description by ID
  const getDocumentTypeInfo = (id: string) => {
    const docType = DOCUMENT_TYPES.find(dt => dt.id === id);
    return {
      name: docType?.name || 'Unknown Document Type',
      description: docType?.description || '',
    };
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Configure required document types and vehicle types for each entity type
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="delivery">Delivery Partners</TabsTrigger>
          <TabsTrigger value="vendor">Vendors</TabsTrigger>
          <TabsTrigger value="affiliate">Affiliates</TabsTrigger>
        </TabsList>

        {(['delivery', 'vendor', 'affiliate'] as const).map((entityType) => (
          <TabsContent key={entityType} value={entityType} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {entityType === 'delivery' ? 'Delivery Partner' : entityType === 'vendor' ? 'Vendor' : 'Affiliate'} Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {config[entityType].document_types.map((docType, index) => (
                    <div key={index} className="flex flex-col gap-2 p-4 border rounded-md">
                      <div className="flex items-center gap-2">
                        <Select
                          value={docType.document_type_id}
                          onValueChange={val => updateDocumentType(entityType, index, 'document_type_id', val)}
                          disabled={!isEditable}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            {DOCUMENT_TYPES.map(dt => (
                              <SelectItem key={dt.slug} value={dt.slug}>{dt.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Checkbox
                          checked={docType.is_required}
                          onCheckedChange={val => updateDocumentType(entityType, index, 'is_required', !!val)}
                          disabled={!isEditable}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeDocumentType(entityType, index)} disabled={!isEditable}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        className="w-full"
                        placeholder="Description"
                        value={docType.description || ''}
                        onChange={e => updateDocumentType(entityType, index, 'description', e.target.value)}
                        disabled={!isEditable}
                      />
                    </div>
                  ))}

                  <Button type="button" variant="outline" size="sm" onClick={() => addDocumentType(entityType)} disabled={!isEditable}>
                    <PlusCircle className="w-4 h-4 mr-1" /> Add Document Type
                  </Button>

                  {config[entityType].document_types.length === 0 && (
                    <div className="text-center py-8 border rounded-md">
                      <p className="text-muted-foreground">
                        No document types configured for this entity type
                      </p>
                    </div>
                  )}
                </div>
                <Separator />
                {entityType === 'delivery' && (
                  <div className="space-y-4">
                    {config[entityType].vehicle_types?.map((vehicleType, index) => (
                      <div key={index} className="flex flex-col gap-2 p-4 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Select
                            value={vehicleType.vehicle_type_id}
                            onValueChange={val => updateVehicleType(entityType, index, 'vehicle_type_id', val)}
                            disabled={!isEditable}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                            <SelectContent>
                              {VEHICLE_TYPES.map(vt => (
                                <SelectItem key={vt.slug} value={vt.slug}>{vt.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Checkbox
                            checked={vehicleType.is_active}
                            onCheckedChange={val => updateVehicleType(entityType, index, 'is_active', !!val)}
                            disabled={!isEditable}
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeVehicleType(entityType, index)} disabled={!isEditable}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input
                          className="w-full"
                          placeholder="Description"
                          value={vehicleType.description || ''}
                          onChange={e => updateVehicleType(entityType, index, 'description', e.target.value)}
                          disabled={!isEditable}
                        />
                      </div>
                    ))}

                    <Button type="button" variant="outline" size="sm" onClick={() => addVehicleType(entityType)} disabled={!isEditable}>
                      <PlusCircle className="w-4 h-4 mr-1" /> Add Vehicle Type
                    </Button>

                    {(!config[entityType].vehicle_types || config[entityType].vehicle_types.length === 0) && (
                      <div className="text-center py-8 border rounded-md">
                        <p className="text-muted-foreground">
                          No vehicle types configured for this entity type
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}