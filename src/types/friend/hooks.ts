import type { BlockRelationWithUser } from './block-user';
import type { FriendRelationWithMinimalUser } from './common';
import type { UserSearchResult } from './search-user';

// useBlockList
export interface UseBlockListOptions {
  limit?: number;
  autoLoad?: boolean;
}

export interface UseBlockListReturn {
  blockList: BlockRelationWithUser[];
  total: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => void;
}

// useFriendsList
export interface UseFriendsListOptions {
  limit?: number;
  autoLoad?: boolean;
}

export interface UseFriendsListReturn {
  friends: FriendRelationWithMinimalUser[];
  total: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => void;
  onlineStatus: Record<string, boolean>;
}

// useOnlineStatus
export interface UseOnlineStatusOptions {
  userIds: string[];
  autoLoad?: boolean;
  refreshInterval?: number;
}

export interface UseOnlineStatusReturn {
  statuses: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// usePendingRequests
export interface UsePendingRequestsOptions {
  type?: 'received' | 'sent';
  limit?: number;
  autoLoad?: boolean;
}

export interface UsePendingRequestsReturn {
  requests: FriendRelationWithMinimalUser[];
  total: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  type: 'received' | 'sent';
  loadMore: () => Promise<void>;
  refresh: () => void;
}

// useSearchUsers
export interface UseSearchUsersOptions {
  debounceMs?: number;
}

export interface UseSearchUsersReturn {
  results: UserSearchResult[];
  total: number;
  loading: boolean;
  error: string | null;
  search: (query: string, searchType: 'email' | 'name') => void;
  clear: () => void;
}

