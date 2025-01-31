'use client';

import { Suspense } from 'react';
import { OrdersUploadContent } from '@/components/orders/orders-upload';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function OrdersUploadPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrdersUploadContent />
    </Suspense>
  );
}