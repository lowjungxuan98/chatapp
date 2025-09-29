"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { friendsApi } from '@/lib/api/friends';
import { useSocket } from '@/socket/client';
import type { UseOnlineStatusOptions, UseOnlineStatusReturn, FriendOnlineStatusPayload } from '@/types/friend';

export function useOnlineStatus({ userIds, autoLoad = true, refreshInterval }: UseOnlineStatusOptions): UseOnlineStatusReturn {
  const socket = useSocket();
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const fetchOnlineStatus = useCallback(async () => {
    if (!userIds.length || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await friendsApi.getOnlineStatus(userIds);
      if (response.success && response.data) {
        setStatuses(response.data.statuses);
      } else {
        setError(response.message || '获取在线状态失败');
      }
    } catch {
      setError('获取在线状态时发生错误');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [userIds]);

  useEffect(() => {
    if (!socket) return;
    const handleStatusChange = (payload: FriendOnlineStatusPayload, isOnline: boolean) => {
      if (userIds.includes(payload.userId)) {
        setStatuses(prev => ({ ...prev, [payload.userId]: isOnline }));
      }
    };
    socket.on('friend:online', (p: FriendOnlineStatusPayload) => handleStatusChange(p, true));
    socket.on('friend:offline', (p: FriendOnlineStatusPayload) => handleStatusChange(p, false));
    return () => {
      socket.off('friend:online');
      socket.off('friend:offline');
    };
  }, [socket, userIds]);

  useEffect(() => {
    if (autoLoad && userIds.length) fetchOnlineStatus();
  }, [autoLoad, userIds, fetchOnlineStatus]);

  useEffect(() => {
    if (!refreshInterval || !userIds.length) return;
    const interval = setInterval(fetchOnlineStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, userIds, fetchOnlineStatus]);

  return { statuses, loading, error, refresh: fetchOnlineStatus };
}
