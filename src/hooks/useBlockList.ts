"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { friendsApi } from '@/lib/api/friends';
import { useSocket } from '@/socket/client';
import type { BlockRelationWithUser, UseBlockListOptions, UseBlockListReturn, UserUnblockedPayload } from '@/types/friend';

export function useBlockList({ limit = 20, autoLoad = true }: UseBlockListOptions = {}): UseBlockListReturn {
  const socket = useSocket();
  const [blockList, setBlockList] = useState<BlockRelationWithUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const loadingRef = useRef(false);

  const fetchBlockList = useCallback(async (currentOffset: number, shouldAppend = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await friendsApi.getBlockList({ limit, offset: currentOffset, sortBy: 'createdAt', order: 'desc' });
      if (response.success && response.data) {
        setBlockList(prev => shouldAppend ? [...prev, ...response.data.blockList] : response.data.blockList);
        setTotal(response.data.total);
        setOffset(currentOffset);
      } else {
        setError(response.message || '加载黑名单失败');
      }
    } catch {
      setError('加载黑名单时发生错误');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [limit]);

  const loadMore = useCallback(async () => {
    const nextOffset = offset + limit;
    if (nextOffset < total && !loading) await fetchBlockList(nextOffset, true);
  }, [offset, limit, total, loading, fetchBlockList]);

  const refresh = useCallback(() => fetchBlockList(0, false), [fetchBlockList]);

  useEffect(() => {
    if (!socket) return;
    const handleUserUnblocked = (payload: UserUnblockedPayload) => {
      setBlockList(prev => prev.filter(item => item.blockedId !== payload.blockedId));
      setTotal(prev => Math.max(0, prev - 1));
    };
    socket.on('friend:blocked', refresh);
    socket.on('friend:unblocked', handleUserUnblocked);
    return () => {
      socket.off('friend:blocked', refresh);
      socket.off('friend:unblocked', handleUserUnblocked);
    };
  }, [socket, refresh]);

  useEffect(() => {
    if (autoLoad) fetchBlockList(0, false);
  }, [autoLoad, fetchBlockList]);

  return { blockList, total, loading, error, hasMore: offset + blockList.length < total, loadMore, refresh };
}
