'use client';

import { Suspense } from 'react';
import { WarehousesContent } from '@/components/warehouses/warehouses-content';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function WarehousesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <WarehousesContent />
    </Suspense>
  );
}