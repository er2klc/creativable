// Temporary component to disable problematic components during type fixes
import { Suspense } from 'react';

export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function WrappedComponent(props: T) {
    try {
      return (
        <Suspense fallback={fallback || <div>Loading...</div>}>
          <Component {...props} />
        </Suspense>
      );
    } catch (error) {
      console.error('Component error:', error);
      return <div>Component temporarily disabled due to type issues.</div>;
    }
  };
}

// Simple fallback for lead data
export function asLead(data: any): any {
  return {
    id: data?.id || '',
    name: data?.name || 'Unknown',
    platform: data?.platform || 'Unknown',
    created_at: data?.created_at || new Date().toISOString(),
    pipeline: data?.pipeline || { name: 'Unknown' },
    phase: data?.phase || { name: 'Unknown' },
    ...data
  };
}