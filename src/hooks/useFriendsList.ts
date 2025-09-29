"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { friendsApi } from '@/lib/api/friends';
import { useSocket } from '@/socket/client';
import type { FriendRelationWithMinimalUser, UseFriendsListOptions, UseFriendsListReturn, FriendRequestAcceptedPayload, FriendRemovedPayload, FriendOnlineStatusPayload } from '@/types/friend';

export function useFriendsList({ limit = 20, autoLoad = true }: UseFriendsListOptions = {}): UseFriendsListReturn {
  const socket = useSocket();
  const [friends, setFriends] = useState<FriendRelationWithMinimalUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
  const loadingRef = useRef(false);

  const fetchFriends = useCallback(async (currentOffset: number, shouldAppend = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await friendsApi.getFriendsList({ limit, offset: currentOffset, sortBy: 'createdAt', order: 'desc' });
      if (response.success && response.data) {
        const newFriends = response.data.friends;
        setFriends(prev => shouldAppend ? [...prev, ...newFriends] : newFriends);
        setTotal(response.data.total);
        setOffset(currentOffset);

        if (newFriends.length) {
          const statusResponse = await friendsApi.getOnlineStatus(newFriends.map(f => f.friend.id));
          if (statusResponse.success && statusResponse.data) {
            setOnlineStatus(prev => ({ ...prev, ...statusResponse.data.statuses }));
          }
        }
      } else {
        setError(response.message || '加载好友列表失败');
      }
    } catch {
      setError('加载好友列表时发生错误');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [limit]);

  const loadMore = useCallback(async () => {
    const nextOffset = offset + limit;
    if (nextOffset < total && !loading) await fetchFriends(nextOffset, true);
  }, [offset, limit, total, loading, fetchFriends]);

  const refresh = useCallback(() => fetchFriends(0, false), [fetchFriends]);

  useEffect(() => {
    if (!socket) return;
    const handleFriendRemoved = (payload: FriendRemovedPayload) => {
      setFriends(prev => prev.filter(f => f.friend.id !== payload.friendId));
      setTotal(prev => Math.max(0, prev - 1));
    };
    const handleOnlineStatus = (payload: FriendOnlineStatusPayload, isOnline: boolean) => {
      setOnlineStatus(prev => ({ ...prev, [payload.userId]: isOnline }));
    };

    socket.on('friend:request:accepted', (_p: FriendRequestAcceptedPayload) => refresh());
    socket.on('friend:removed', handleFriendRemoved);
    socket.on('friend:online', (p: FriendOnlineStatusPayload) => handleOnlineStatus(p, true));
    socket.on('friend:offline', (p: FriendOnlineStatusPayload) => handleOnlineStatus(p, false));

    return () => {
      socket.off('friend:request:accepted', refresh);
      socket.off('friend:removed', handleFriendRemoved);
      socket.off('friend:online');
      socket.off('friend:offline');
    };
  }, [socket, refresh]);

  useEffect(() => {
    if (autoLoad) fetchFriends(0, false);
  }, [autoLoad, fetchFriends]);

  return { friends, total, loading, error, hasMore: offset + friends.length < total, loadMore, refresh, onlineStatus };
}
