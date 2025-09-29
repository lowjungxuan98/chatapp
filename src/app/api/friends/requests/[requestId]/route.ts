import { NextRequest, NextResponse } from "next/server";
import { acceptFriendRequest, declineFriendRequest, cancelFriendRequest } from "@/app/api/friends/requests/[requestId]/service";
import { RespondMiddleware, CancelMiddleware } from '@/app/api/friends/requests/[requestId]/middleware';
import { ApiResponse, RouteContext, RespondToFriendRequestResponse, RemoveFriendResponse } from '@/types';
import { getSocketIO } from '@/types/socket';
import { emitFriendAccepted, emitFriendDeclined } from '@/socket/server/events/friend';

export const PATCH = RespondMiddleware<RespondToFriendRequestResponse>(async (request: NextRequest, context?: RouteContext) => {
  try {
    const body = await request.json();
    const requestId: string = (await context!.params).requestId!;
    const result = body.action === 'accept' 
      ? await acceptFriendRequest(request.user!.id!, requestId)
      : await declineFriendRequest(request.user!.id!, requestId);

    const io = getSocketIO();
    if (io) {
      if (body.action === 'accept') {
        const timestamp = result.updatedAt.toISOString();
        emitFriendAccepted(
          io, 
          result.userId, 
          result.friendId,
          { requestId: result.id, userId: result.userId, friendId: result.friendId, friend: result.friend, timestamp },
          { requestId: result.id, userId: result.friendId, friendId: result.userId, friend: result.user, timestamp }
        );
      } else {
        emitFriendDeclined(io, result.userId, {
          requestId: result.id,
          userId: result.userId,
          friendId: result.friendId,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json<ApiResponse<RespondToFriendRequestResponse>>({
      success: true,
      message: `Friend request ${body.action}ed`,
      data: { request: result, message: `Friend request ${body.action}ed successfully` }
    }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to respond to friend request';
    const statusCode = errorMessage.includes('not found') ? 404 : errorMessage.includes('not authorized') ? 403 : errorMessage.includes('not pending') ? 400 : 500;

    return NextResponse.json<ApiResponse<RespondToFriendRequestResponse>>({
      success: false,
      message: errorMessage,
      error: error
    }, { status: statusCode });
  }
});

export const DELETE = CancelMiddleware<RemoveFriendResponse>(async (request: NextRequest, context?: RouteContext) => {
  try {
    const requestId: string = (await context!.params).requestId!;
    const result = await cancelFriendRequest(request.user!.id!, requestId);

    const io = getSocketIO();
    if (io) {
      emitFriendDeclined(io, result.friendId, {
        requestId: result.id,
        userId: result.userId,
        friendId: result.friendId,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json<ApiResponse<RemoveFriendResponse>>({
      success: true,
      message: 'Friend request cancelled successfully',
      data: { message: 'Friend request cancelled successfully' }
    }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel friend request';
    const statusCode = errorMessage.includes('not found') ? 404 : errorMessage.includes('not authorized') ? 403 : errorMessage.includes('not pending') ? 400 : 500;

    return NextResponse.json<ApiResponse<RemoveFriendResponse>>({
      success: false,
      message: errorMessage,
      error: error
    }, { status: statusCode });
  }
});

