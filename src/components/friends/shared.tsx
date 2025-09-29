"use client";

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCcw, LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Loading Skeleton
export function LoadingSkeleton({ count = 5, showAction = true }: { count?: number; showAction?: boolean }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          {showAction && <Skeleton className="h-9 w-24" />}
        </div>
      ))}
    </div>
  );
}

// Error Alert
export function ErrorAlert({ error, onRetry }: { error: string; onRetry: () => void }) {
  const t = useTranslations('Common');
  return (
    <Alert variant="destructive">
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCcw className="size-4" />
          {t('back')}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

// Empty State
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: LucideIcon; 
  title: string; 
  description: string; 
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// List Header with count only
export function ListHeader({ 
  total, 
  shown, 
  label = ''
}: { 
  total: number; 
  shown: number; 
  label?: string;
}) {
  return (
    <div className="text-sm text-muted-foreground">
      {total} {label}
      {shown < total && <span className="ml-1">({shown} shown)</span>}
    </div>
  );
}

