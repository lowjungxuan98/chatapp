import { NextRequest, NextResponse } from "next/server";
import { sendFriendRequest } from "@/app/api/friends/requests/service";
import { RouteMiddleware } from '@/app/api/friends/requests/middleware';
import { ApiResponse, SendFriendRequestResponse, FriendRequestSentPayload } from '@/types';
import { getSocketIO } from '@/types/socket';
import { emitFriendRequest } from '@/socket/server/events/friend';

export const POST = RouteMiddleware<SendFriendRequestResponse>(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const friendRequest = await sendFriendRequest(request.user!.id!, body.friendId);

    const io = getSocketIO();
    if (io) {
      const payload: FriendRequestSentPayload = {
        requestId: friendRequest.id,
        from: { id: friendRequest.user.id, name: friendRequest.user.name, image: friendRequest.user.image },
        to: { id: friendRequest.friend.id, name: friendRequest.friend.name, image: friendRequest.friend.image },
        status: friendRequest.status,
        timestamp: friendRequest.createdAt.toISOString(),
      };
      emitFriendRequest(io, body.friendId, payload);
    }

    return NextResponse.json<ApiResponse<SendFriendRequestResponse>>({
      success: true,
      message: 'Friend request sent successfully',
      data: { request: friendRequest, message: 'Friend request sent successfully' }
    }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send friend request';
    const statusCode = errorMessage.includes('not found') ? 404 : 
      (errorMessage.includes('blocked') || errorMessage.includes('yourself') || errorMessage.includes('already exists') || errorMessage.includes('Already friends')) ? 400 : 500;

    return NextResponse.json<ApiResponse<SendFriendRequestResponse>>({
      success: false,
      message: errorMessage,
      error: error
    }, { status: statusCode });
  }
});

