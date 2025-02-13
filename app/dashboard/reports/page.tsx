'use client';

import { Suspense } from 'react';
import { ReportsContent } from '@/components/reports/reports-content';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ReportsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ReportsContent />
    </Suspense>
  );
}