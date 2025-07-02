/**
 * Vehicle types for verification
 */
export interface VehicleTypeOption {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
}

export const VEHICLE_TYPES: VehicleTypeOption[] = [
    {
        slug: 'truck',
        name: 'Truck',
        description: 'Truck for cargo transport',
        icon: '🚚'
    },
    {
        slug: 'van',
        name: 'Van',
        description: 'Van for cargo transport',
        icon: '🚛'
    },
    {
        slug: 'motorcycle',
        name: 'Motorcycle',
        description: 'Motorcycle for personal transport',
        icon: '🚲'
    },
    {
        slug: 'bus',
        name: 'Bus',
        description: 'Bus for public transport',
        icon: '🚌'
    },
]