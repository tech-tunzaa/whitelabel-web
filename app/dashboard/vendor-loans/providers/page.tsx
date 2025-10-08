import { Suspense } from 'react';
import { Metadata } from 'next';

import { PageHeader } from '@/components/page-header';
import { LoanProvidersContent } from '@/features/loans/providers/components/providers-content';
import { LoadingPage } from '@/components/loading-page';

export const metadata: Metadata = {
  title: 'Loan Providers | Marketplace Dashboard',
  description: 'Manage loan providers for your organization',
};

export default function LoanProvidersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <PageHeader
        title="Loan Providers"
        description="Manage loan providers for your organization"
      />
      
      <Suspense fallback={<LoadingPage />}>
        <LoanProvidersContent />
      </Suspense>
    </div>
  );
}
