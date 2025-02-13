'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SignupContent } from '@/components/signup/signup-content';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SignupContent />
    </Suspense>
  );
}