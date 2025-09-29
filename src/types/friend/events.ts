import type { FriendStatus } from '@prisma/client';
import type { FriendRelationWithMinimalUser } from '@/types/friend';

type UserPayload = { id: string; name: string | null; image: string | null };
type TimestampedPayload = { timestamp: string };
type SocketCallback = (response: { success: boolean; message?: string; error?: string }) => void;

export interface FriendRequestSentPayload extends TimestampedPayload {
  requestId: string;
  from: UserPayload;
  to: UserPayload;
  status: FriendStatus;
}

export interface FriendRequestAcceptedPayload extends TimestampedPayload {
  requestId: string;
  userId: string;
  friendId: string;
  friend: UserPayload;
}

export interface FriendRequestDeclinedPayload extends TimestampedPayload {
  requestId: string;
  userId: string;
  friendId: string;
}

export interface FriendRemovedPayload extends TimestampedPayload {
  userId: string;
  friendId: string;
}

export interface FriendOnlineStatusPayload {
  userId: string;
  online: boolean;
  lastSeen?: string;
}

export interface UserBlockedPayload extends TimestampedPayload {
  blockerId: string;
  blockedId: string;
}

export interface UserUnblockedPayload extends TimestampedPayload {
  blockerId: string;
  blockedId: string;
}

export interface S2CFriendEvents {
  'friend:request:received': (payload: FriendRequestSentPayload) => void;
  'friend:request:accepted': (payload: FriendRequestAcceptedPayload) => void;
  'friend:request:declined': (payload: FriendRequestDeclinedPayload) => void;
  'friend:removed': (payload: FriendRemovedPayload) => void;
  'friend:online': (payload: FriendOnlineStatusPayload) => void;
  'friend:offline': (payload: FriendOnlineStatusPayload) => void;
  'friend:blocked': (payload: UserBlockedPayload) => void;
  'friend:unblocked': (payload: UserUnblockedPayload) => void;
}

export interface C2SFriendEvents {
  'friend:request:send': (data: { friendId: string }, callback?: SocketCallback) => void;
  'friend:request:accept': (data: { requestId: string }, callback?: SocketCallback) => void;
  'friend:request:decline': (data: { requestId: string }, callback?: SocketCallback) => void;
  'friend:remove': (data: { friendId: string }, callback?: SocketCallback) => void;
  'friend:list': (callback?: (response: { success: boolean; friends?: FriendRelationWithMinimalUser[]; error?: string }) => void) => void;
  'friend:block': (data: { userId: string }, callback?: SocketCallback) => void;
  'friend:unblock': (data: { userId: string }, callback?: SocketCallback) => void;
}

