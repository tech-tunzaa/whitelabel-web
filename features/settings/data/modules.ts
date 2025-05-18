// Define the available platform modules with their display information
export interface ModuleConfig {
  name: string;    // Used as reference key in tenant's modules object
  label: string;   // Display label for UI
  description: string; // Description text for UI
}

// Array of all available platform modules
export const platformModules: ModuleConfig[] = [
  {
    name: "payments",
    label: "Payments Module",
    description: "Enables payment processing and transaction management"
  },
  {
    name: "promotions",
    label: "Promotions Module",
    description: "Enables discounts, coupons, and marketing campaigns"
  },
  {
    name: "inventory",
    label: "Inventory Module",
    description: "Enables inventory tracking and management"
  }
];

// Helper function to check if a module is enabled for a tenant
export const isModuleEnabled = (tenantModules: Record<string, boolean> | undefined, moduleName: string): boolean => {
  if (!tenantModules) return false;
  return !!tenantModules[moduleName];
};
