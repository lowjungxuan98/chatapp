'use client';

import { usePathname } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

function getBreadcrumbs(pathname: string) {
  const [locale, ...segments] = pathname.split('/').filter(Boolean);
  
  return segments.map((segment, index) => ({
    href: `/${[locale, ...segments.slice(0, index + 1)].join('/')}`,
    label: segment.charAt(0).toUpperCase() + segment.slice(1),
    isLast: index === segments.length - 1,
  }));
}

export function BreadcrumbNav() {
  const breadcrumbs = getBreadcrumbs(usePathname());
  
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem className="hidden md:block">
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

