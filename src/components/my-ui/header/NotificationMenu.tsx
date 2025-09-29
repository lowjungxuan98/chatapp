'use client';

import { Bell, Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  type: 'friendRequest' | 'message' | 'groupInvite' | 'systemUpdate' | 'profileView';
  params?: { name?: string; group?: string };
  time: string;
  read: boolean;
}

const dummyNotifications: Notification[] = [
  { id: '1', type: 'friendRequest', params: { name: 'John Doe' }, time: '5m ago', read: false },
  { id: '2', type: 'message', params: { name: 'Sarah' }, time: '10m ago', read: false },
  { id: '3', type: 'groupInvite', params: { group: 'Project Team' }, time: '1h ago', read: false },
  { id: '4', type: 'systemUpdate', time: '2h ago', read: true },
  { id: '5', type: 'profileView', time: '3h ago', read: true },
];

export function NotificationMenu() {
  const t = useTranslations('Notifications');
  const unreadCount = dummyNotifications.filter(n => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t('title')}</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              {t('markAllRead')}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {dummyNotifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t('noNotifications')}
            </div>
          ) : (
            dummyNotifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 cursor-pointer">
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{t(`types.${notification.type}`)}</p>
                      {!notification.read && <div className="size-2 rounded-full bg-blue-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(`messages.${notification.type}`, notification.params)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                  <div className="flex gap-1">
                    {!notification.read && (
                      <Button variant="ghost" size="icon" className="size-6">
                        <Check className="size-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="size-6">
                      <X className="size-3" />
                    </Button>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        {dummyNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center cursor-pointer">
              {t('viewAll')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

