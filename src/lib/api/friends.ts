import { BaseApiManager } from '@/lib/api/base';
import { ApiResponse } from '@/types';
import {
  GetFriendsQueryData,
  GetFriendsListResponse,
  SendFriendRequestResponse,
  RespondToFriendRequestResponse,
  GetPendingRequestsQueryData,
  GetPendingRequestsResponse,
  RemoveFriendResponse,
  BlockUserResponse,
  UnblockUserResponse,
  GetBlockListQueryData,
  GetBlockListResponse,
  SearchUserQueryData,
  SearchUserResponse,
  OnlineStatusResponse,
  MessageResponse
} from '@/types/friend';

/**
 * Friends API Manager
 * Handles all friend-related API calls
 */
export class FriendsApiManager extends BaseApiManager {
  constructor() {
    super('/api');
  }

  /**
   * Get friends list
   * GET /api/friends
   */
  async getFriendsList(query?: GetFriendsQueryData): Promise<ApiResponse<GetFriendsListResponse>> {
    const params: Record<string, string> = {};
    if (query) {
      if (query.limit !== undefined) params.limit = String(query.limit);
      if (query.offset !== undefined) params.offset = String(query.offset);
      if (query.status) params.status = query.status;
      if (query.search) params.search = query.search;
      if (query.sortBy) params.sortBy = query.sortBy;
      if (query.order) params.order = query.order;
    }
    return this.get<GetFriendsListResponse>('/friends', params);
  }

  /**
   * Send friend request
   * POST /api/friends/requests
   */
  async sendFriendRequest(friendId: string): Promise<ApiResponse<SendFriendRequestResponse>> {
    return this.post<SendFriendRequestResponse>('/friends/requests', { friendId });
  }

  /**
   * Accept friend request
   * PATCH /api/friends/requests/[requestId]
   */
  async acceptFriendRequest(requestId: string): Promise<ApiResponse<RespondToFriendRequestResponse>> {
    return this.patch<RespondToFriendRequestResponse>(
      `/friends/requests/${requestId}`,
      { action: 'accept' }
    );
  }

  /**
   * Decline friend request
   * PATCH /api/friends/requests/[requestId]
   */
  async declineFriendRequest(requestId: string): Promise<ApiResponse<RespondToFriendRequestResponse>> {
    return this.patch<RespondToFriendRequestResponse>(
      `/friends/requests/${requestId}`,
      { action: 'decline' }
    );
  }

  /**
   * Cancel friend request
   * DELETE /api/friends/requests/[requestId]
   */
  async cancelFriendRequest(requestId: string): Promise<ApiResponse<MessageResponse>> {
    return this.delete<MessageResponse>(`/friends/requests/${requestId}`);
  }

  /**
   * Get pending requests (received or sent)
   * GET /api/friends/pending?type=received|sent
   */
  async getPendingRequests(query: GetPendingRequestsQueryData): Promise<ApiResponse<GetPendingRequestsResponse>> {
    const params: Record<string, string> = {
      type: query.type
    };
    if (query.limit !== undefined) params.limit = String(query.limit);
    if (query.offset !== undefined) params.offset = String(query.offset);
    
    return this.get<GetPendingRequestsResponse>('/friends/pending', params);
  }

  /**
   * Remove friend
   * DELETE /api/friends/[friendId]
   */
  async removeFriend(friendId: string): Promise<ApiResponse<RemoveFriendResponse>> {
    return this.delete<RemoveFriendResponse>(`/friends/${friendId}`);
  }

  /**
   * Block user
   * POST /api/friends/block/[userId]
   */
  async blockUser(userId: string): Promise<ApiResponse<BlockUserResponse>> {
    return this.post<BlockUserResponse>(`/friends/block/${userId}`);
  }

  /**
   * Unblock user
   * DELETE /api/friends/block/[userId]
   */
  async unblockUser(userId: string): Promise<ApiResponse<UnblockUserResponse>> {
    return this.delete<UnblockUserResponse>(`/friends/block/${userId}`);
  }

  /**
   * Get block list
   * GET /api/friends/block
   */
  async getBlockList(query?: GetBlockListQueryData): Promise<ApiResponse<GetBlockListResponse>> {
    const params: Record<string, string> = {};
    if (query) {
      if (query.limit !== undefined) params.limit = String(query.limit);
      if (query.offset !== undefined) params.offset = String(query.offset);
      if (query.search) params.search = query.search;
      if (query.sortBy) params.sortBy = query.sortBy;
      if (query.order) params.order = query.order;
    }
    return this.get<GetBlockListResponse>('/friends/block', params);
  }

  /**
   * Search users by name or email
   * GET /api/friends/search?q=...&type=email|name
   */
  async searchUsers(query: SearchUserQueryData): Promise<ApiResponse<SearchUserResponse>> {
    const params: Record<string, string> = {
      q: query.q,
      type: query.type
    };
    if (query.limit !== undefined) params.limit = String(query.limit);
    
    return this.get<SearchUserResponse>('/friends/search', params);
  }

  /**
   * Get online status for multiple users
   * POST /api/friends/online-status
   */
  async getOnlineStatus(userIds: string[]): Promise<ApiResponse<OnlineStatusResponse>> {
    return this.post<OnlineStatusResponse>('/friends/online-status', { userIds });
  }
}

// Create and export a singleton instance
export const friendsApi = new FriendsApiManager();

