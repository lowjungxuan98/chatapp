"use client";

import { useState, useEffect } from 'react';
import { useFriendsList } from '@/hooks/useFriendsList';
import { useSearchUsers } from '@/hooks/useSearchUsers';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { FriendListItem } from '@/components/friends/FriendListItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Loader2, Search } from 'lucide-react';
import { LoadingSkeleton, ErrorAlert, EmptyState, ListHeader } from '@/components/friends/shared';
import { useTranslations } from 'next-intl';
import type { RelationStatus } from '@/types/friend';

export default function Friends() {
  const t = useTranslations('Friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const { friends, total, loading, error, hasMore, loadMore, refresh, onlineStatus } = useFriendsList({ limit: 20 });
  const { results: searchResults, total: searchTotal, loading: searchLoading, error: searchError, search, clear } = useSearchUsers({ debounceMs: 300 });
  
  const loadMoreRef = useIntersectionObserver(loadMore, hasMore && !loading, [hasMore, loading]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      search(searchQuery, 'name');
    } else {
      setIsSearching(false);
      clear();
    }
  }, [searchQuery, search, clear]);

  if (loading && !friends.length) return <LoadingSkeleton />;
  if (error && !friends.length) return <ErrorAlert error={error} onRetry={refresh} />;
  if (!friends.length && !isSearching) {
    return <EmptyState icon={Users} title={t('empty.noFriends')} description={t('empty.noFriendsDesc')} />;
  }

  const displayFriends = isSearching ? searchResults.map(result => ({
    id: `search-${result.id}`,
    userId: result.id,
    friendId: result.id,
    status: 'ACCEPTED' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    friend: { id: result.id, name: result.name, image: result.image },
    user: { id: result.id, name: result.name, image: result.image },
    relationStatus: result.relationStatus
  })) : friends;

  const displayTotal = isSearching ? searchTotal : total;
  const displayLoading = isSearching ? searchLoading : loading;
  const displayError = isSearching ? searchError : error;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <ListHeader 
          total={displayTotal} 
          shown={displayFriends.length} 
          label={isSearching ? t('search.results') : t('list.totalFriends')} 
        />

        {displayError && <div className="text-sm text-destructive text-center py-2">{displayError}</div>}

        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-3 pr-4">
            {displayFriends.map((friend) => (
              <FriendListItem 
                key={friend.id} 
                friend={friend} 
                online={onlineStatus[friend.friend.id] ?? false} 
                relationStatus={'relationStatus' in friend ? friend.relationStatus as RelationStatus : 'friend'}
              />
            ))}
            
            {hasMore && !isSearching && (
              <div ref={loadMoreRef} className="py-4 text-center">
                {displayLoading ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">{t('list.loading')}</span>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={loadMore}>{t('list.loadMore')}</Button>
                )}
              </div>
            )}

            {displayFriends.length === 0 && !displayLoading && (
              <div className="py-8 text-center text-muted-foreground">
                {isSearching ? <Search className="h-8 w-8 mx-auto mb-2 opacity-50" /> : <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />}
                <p>{isSearching ? t('search.noResults') : t('empty.noFriends')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
