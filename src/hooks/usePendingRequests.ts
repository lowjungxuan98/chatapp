"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { friendsApi } from '@/lib/api/friends';
import { useSocket } from '@/socket/client';
import type { FriendRelationWithMinimalUser, UsePendingRequestsOptions, UsePendingRequestsReturn, FriendRequestSentPayload, FriendRequestAcceptedPayload, FriendRequestDeclinedPayload } from '@/types/friend';

export function usePendingRequests({ type = 'received', limit = 20, autoLoad = true }: UsePendingRequestsOptions = {}): UsePendingRequestsReturn {
  const socket = useSocket();
  const [requests, setRequests] = useState<FriendRelationWithMinimalUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const loadingRef = useRef(false);

  const fetchRequests = useCallback(async (currentOffset: number, shouldAppend = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await friendsApi.getPendingRequests({ type, limit, offset: currentOffset });
      if (response.success && response.data) {
        setRequests(prev => shouldAppend ? [...prev, ...response.data.requests] : response.data.requests);
        setTotal(response.data.total);
        setOffset(currentOffset);
      } else {
        setError(response.message || '加载待处理请求失败');
      }
    } catch {
      setError('加载待处理请求时发生错误');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [type, limit]);

  const loadMore = useCallback(async () => {
    const nextOffset = offset + limit;
    if (nextOffset < total && !loading) await fetchRequests(nextOffset, true);
  }, [offset, limit, total, loading, fetchRequests]);

  const refresh = useCallback(() => fetchRequests(0, false), [fetchRequests]);

  useEffect(() => {
    if (!socket) return;
    const handleRequestChange = (payload: FriendRequestAcceptedPayload | FriendRequestDeclinedPayload) => {
      setRequests(prev => prev.filter(r => r.id !== payload.requestId));
      setTotal(prev => Math.max(0, prev - 1));
    };

    socket.on('friend:request:received', (_p: FriendRequestSentPayload) => type === 'received' && refresh());
    socket.on('friend:request:accepted', handleRequestChange);
    socket.on('friend:request:declined', handleRequestChange);

    return () => {
      socket.off('friend:request:received', refresh);
      socket.off('friend:request:accepted', handleRequestChange);
      socket.off('friend:request:declined', handleRequestChange);
    };
  }, [socket, type, refresh]);

  useEffect(() => {
    if (autoLoad) fetchRequests(0, false);
  }, [autoLoad, type, fetchRequests]);

  return { requests, total, loading, error, hasMore: offset + requests.length < total, type, loadMore, refresh };
}
