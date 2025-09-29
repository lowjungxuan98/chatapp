'use client';

import { useSession } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbNav } from '@/components/my-ui/header/BreadcrumbNav';
import { LanguageSwitcher } from '@/components/my-ui/header/LanguageSwitcher';
import { ThemeSwitch } from '@/components/my-ui/header/ThemeSwitch';
import { NotificationMenu } from '@/components/my-ui/header/NotificationMenu';
import { UserProfileMenu } from '@/components/my-ui/header/UserProfileMenu';

interface SiteHeaderProps {
  showSidebar?: boolean;
}

export function SiteHeader({ showSidebar = false }: SiteHeaderProps) {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      {showSidebar && isAuthenticated && (
        <>
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <BreadcrumbNav />
        </>
      )}
      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitch />
        {isAuthenticated && <NotificationMenu />}
        <UserProfileMenu />
      </div>
    </header>
  );
}
