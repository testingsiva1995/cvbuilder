import React, { Suspense } from 'react';
import CVBuilderClient from './components/CVBuilderClient';

export default function CVBuilderPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <CVBuilderClient />
    </Suspense>
  );
}