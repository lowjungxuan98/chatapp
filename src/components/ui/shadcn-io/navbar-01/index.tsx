'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface NavProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Navbar01 = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, children, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        'flex justify-between sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4',
        className
      )}
      {...props}
    >
      {children}
    </header>
  )
);
Navbar01.displayName = "Navbar01";

export const NavLeading = React.forwardRef<HTMLDivElement, NavProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  )
);
NavLeading.displayName = "NavLeading";

export const NavMain = React.forwardRef<HTMLDivElement, NavProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-6", className)} {...props}>
      {children}
    </div>
  )
);
NavMain.displayName = "NavMain";

export const NavTrailing = React.forwardRef<HTMLDivElement, NavProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-3", className)} {...props}>
      {children}
    </div>
  )
);
NavTrailing.displayName = "NavTrailing";