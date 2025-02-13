'use client';

import { Suspense } from 'react';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
)
}