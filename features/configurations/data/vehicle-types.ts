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
        slug: 'boda-boda',
        name: 'Boda Boda',
        description: '',
        icon: '🏍'
    },
    {
        slug: 'bajaj',
        name: 'Bajaji',
        description: '',
        icon: '🛺'
    },
    {
        slug: 'kirikuu',
        name: 'Kirikuu',
        description: 'A mini Central Truck',
        icon: '🛻'
    },
    {
        slug: 'central-truck',
        name: 'Central Truck',
        description: '',
        icon: '🚚'
    },
]