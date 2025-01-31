'use client';

import { Suspense } from 'react';
import { CouriersContent } from '@/components/couriers/couriers-content';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CouriersPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CouriersContent />
    </Suspense>
  );
}