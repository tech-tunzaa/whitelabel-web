/**
 * Document types for verification
 */
export interface DocumentTypeOption {
  id: string;
  label: string;
  category: 'identity' | 'business' | 'financial' | 'other';
  description?: string;
}

export const DOCUMENT_TYPES: DocumentTypeOption[] = [
  // Identity documents
  {
    id: 'nida',
    label: 'NIDA (National ID)',
    category: 'identity',
    description: 'National Identification Authority ID card'
  },
  {
    id: 'passport',
    label: 'Passport',
    category: 'identity',
    description: 'International passport'
  },
  {
    id: 'drivers_license',
    label: 'Driver\'s License',
    category: 'identity',
    description: 'Government issued driver\'s license'
  },
  {
    id: 'voter_id',
    label: 'Voter ID',
    category: 'identity',
    description: 'Voter identification card'
  },
  
  // Business documents
  {
    id: 'business_registration',
    label: 'Business Registration Certificate',
    category: 'business',
    description: 'Official business registration certificate'
  },
  {
    id: 'business_license',
    label: 'Business License',
    category: 'business',
    description: 'Current business operating license'
  },
  {
    id: 'tax_clearance',
    label: 'Tax Clearance Certificate',
    category: 'business',
    description: 'Certificate of tax compliance'
  },
  {
    id: 'trademark_certificate',
    label: 'Trademark Certificate',
    category: 'business',
    description: 'Proof of trademark registration'
  },
  
  // Financial documents
  {
    id: 'financial_statement',
    label: 'Financial Statement',
    category: 'financial',
    description: 'Audited financial statements'
  },
  {
    id: 'bank_statement',
    label: 'Bank Statement',
    category: 'financial',
    description: 'Recent bank statements'
  },
  {
    id: 'tax_returns',
    label: 'Tax Returns',
    category: 'financial',
    description: 'Recent tax return filings'
  },
  
  // Other documents
  {
    id: 'utility_bill',
    label: 'Utility Bill',
    category: 'other',
    description: 'Recent utility bill for address verification'
  },
  {
    id: 'lease_agreement',
    label: 'Lease Agreement',
    category: 'other',
    description: 'Business premises lease agreement'
  },
  {
    id: 'other',
    label: 'Other Document',
    category: 'other',
    description: 'Any other relevant document'
  }
];

// Helper function to get document types by category
export function getDocumentTypesByCategory(category: 'identity' | 'business' | 'financial' | 'other' | 'all' = 'all'): DocumentTypeOption[] {
  if (category === 'all') return DOCUMENT_TYPES;
  return DOCUMENT_TYPES.filter(doc => doc.category === category);
}

// Helper function to get a document type by ID
export function getDocumentTypeById(id: string): DocumentTypeOption | undefined {
  return DOCUMENT_TYPES.find(doc => doc.id === id);
}
