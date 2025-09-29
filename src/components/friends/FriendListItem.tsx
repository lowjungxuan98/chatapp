"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MessageCircle, MoreVertical, UserMinus, Ban } from 'lucide-react';
import { friendsApi } from '@/lib/api/friends';
import { toast } from 'sonner';
import type { FriendRelationWithMinimalUser, RelationStatus } from '@/types/friend';
import { useTranslations } from 'next-intl';

interface FriendListItemProps {
  friend: FriendRelationWithMinimalUser;
  online: boolean;
  relationStatus?: RelationStatus;
}

const getInitials = (name: string | null) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

export function FriendListItem({ friend, online, relationStatus = 'friend' }: FriendListItemProps) {
  const t = useTranslations('Friends');
  const [dialogType, setDialogType] = useState<'remove' | 'block' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const friendUser = friend.friend;
  const userName = friendUser.name || t('status.unknownUser');
  const isFriend = relationStatus === 'friend';

  const handleSendRequest = async () => {
    setIsProcessing(true);
    try {
      const response = await friendsApi.sendFriendRequest(friendUser.id);
      toast[response.success ? 'success' : 'error'](
        response.success ? t('toast.sendRequestSuccess') : t('toast.sendRequestError'),
        { description: response.message || t(response.success ? 'toast.sendRequestSuccessDesc' : 'toast.sendRequestErrorDesc', { name: userName }) }
      );
    } catch {
      toast.error(t('toast.sendRequestError'), { description: t('toast.sendRequestErrorDesc') });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      const isRemove = dialogType === 'remove';
      const response = isRemove ? await friendsApi.removeFriend(friendUser.id) : await friendsApi.blockUser(friendUser.id);
      const successKey = isRemove ? 'toast.removeFriendSuccess' : 'toast.blockUserSuccess';
      const errorKey = isRemove ? 'toast.removeFriendError' : 'toast.blockUserError';
      const successDescKey = isRemove ? 'toast.removeFriendSuccessDesc' : 'toast.blockUserSuccessDesc';
      const errorDescKey = isRemove ? 'toast.removeFriendErrorDesc' : 'toast.blockUserErrorDesc';
      
      toast[response.success ? 'success' : 'error'](
        t(response.success ? successKey : errorKey),
        { description: response.message || t(response.success ? successDescKey : errorDescKey, { name: userName }) }
      );
      if (response.success) setDialogType(null);
    } catch {
      const errorKey = dialogType === 'remove' ? 'toast.removeFriendError' : 'toast.blockUserError';
      const errorDescKey = dialogType === 'remove' ? 'toast.removeFriendErrorDesc' : 'toast.blockUserErrorDesc';
      toast.error(t(errorKey), { description: t(errorDescKey) });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50">
        <div className="relative">
          <Avatar className="size-12">
            <AvatarImage src={friendUser.image || undefined} alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(friendUser.name)}</AvatarFallback>
          </Avatar>
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{userName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{online ? t('currentlyOnline') : t('offline')}</p>
        </div>
        <div className="flex items-center gap-2">
          {relationStatus === 'none' && (
            <Button variant="outline" size="sm" onClick={handleSendRequest} disabled={isProcessing} className="gap-2">
              <MessageCircle className="size-4" />
              <span className="hidden sm:inline">{t('actions.sendRequest')}</span>
            </Button>
          )}
          {relationStatus === 'friend' && (
            <Button variant="outline" size="sm" onClick={() => toast.info(t('actions.featureInDevelopment'))} className="gap-2">
              <MessageCircle className="size-4" />
              <span className="hidden sm:inline">{t('actions.sendMessage')}</span>
            </Button>
          )}
          {relationStatus === 'pending_sent' && (
            <Button variant="outline" size="sm" disabled className="gap-2">
              <span className="text-xs">{t('actions.requestPending')}</span>
            </Button>
          )}
          {isFriend && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9">
                  <MoreVertical className="size-4" />
                  <span className="sr-only">{t('actions.moreActions')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDialogType('remove')}>
                  <UserMinus className="size-4" />
                  {t('actions.removeFriend')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setDialogType('block')}>
                  <Ban className="size-4" />
                  {t('actions.blockUser')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AlertDialog open={!!dialogType} onOpenChange={() => setDialogType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(dialogType === 'remove' ? 'dialogs.confirmRemoveFriend' : 'dialogs.confirmBlockUser')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(dialogType === 'remove' ? 'dialogs.confirmRemoveFriendDesc' : 'dialogs.confirmBlockUserDesc', { name: userName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} disabled={isProcessing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isProcessing ? t('dialogs.processing') : t('dialogs.confirmAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

