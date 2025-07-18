/**
 * Document types for verification
 */
export interface DocumentTypeOption {
  slug: string;
  name: string;
  description?: string;
}

export const DOCUMENT_TYPES: DocumentTypeOption[] = [
  // Identity documents
  {
    slug: 'nida',
    name: 'NIDA (National ID)',
    description: 'National Identification Authority ID card'
  },
  {
    slug: 'passport',
    name: 'Passport',
    description: 'International passport'
  },
  {
    slug: 'drivers_license',
    name: 'Driver\'s License',
    description: 'Government issued driver\'s license'
  },
  {
    slug: 'voter_id',
    name: 'Voter ID',
    description: 'Voter identification card'
  },
  
  // Business documents
  {
    slug: 'business_registration',
    name: 'Business Registration Certificate',
    description: 'Official business registration certificate'
  },
  {
    slug: 'business_license',
    name: 'Business License',
    description: 'Current business operating license'
  },
  {
    slug: 'tax_clearance',
    name: 'Tax Clearance Certificate',
    description: 'Certificate of tax compliance'
  },
  {
    slug: 'trademark_certificate',
    name: 'Trademark Certificate',
    description: 'Proof of trademark registration'
  },
  
  // Financial documents
  {
    slug: 'financial_statement',
    name: 'Financial Statement',
    description: 'Audited financial statements'
  },
  {
    slug: 'bank_statement',
    name: 'Bank Statement',
    description: 'Recent bank statements'
  },
  {
    slug: 'tax_returns',
    name: 'Tax Returns',
    description: 'Recent tax return filings'
  },
  
  // Other documents
  {
    slug: 'utility_bill',
    name: 'Utility Bill',
    description: 'Recent utility bill for address verification'
  },
  {
    slug: 'lease_agreement',
    name: 'Lease Agreement',
    description: 'Business premises lease agreement'
  }
];

