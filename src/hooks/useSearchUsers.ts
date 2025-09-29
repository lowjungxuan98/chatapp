"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { friendsApi } from '@/lib/api/friends';
import type { UserSearchResult, UseSearchUsersOptions, UseSearchUsersReturn } from '@/types/friend';

export function useSearchUsers({ debounceMs = 300 }: UseSearchUsersOptions = {}): UseSearchUsersReturn {
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (query: string, searchType: 'email' | 'name') => {
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await friendsApi.searchUsers({ q: query.trim(), type: searchType, limit: 20 });
      if (response.success && response.data) {
        setResults(response.data.users);
        setTotal(response.data.total);
      } else {
        setError(response.message || '搜索失败');
        setResults([]);
        setTotal(0);
      }
    } catch {
      setError('搜索时发生错误');
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback((query: string, searchType: 'email' | 'name') => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(() => performSearch(query, searchType), debounceMs);
  }, [debounceMs, performSearch]);

  const clear = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setResults([]);
    setTotal(0);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return { results, total, loading, error, search, clear };
}
