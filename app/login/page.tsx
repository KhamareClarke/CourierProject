'use client';

import { Suspense } from 'react';
import { LoginContent } from '@/components/login/login-content';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginContent />
    </Suspense>
  );
}