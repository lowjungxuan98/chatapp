import { NextRequest, NextResponse } from "next/server";
import { removeFriend } from "@/app/api/friends/[friendId]/service";
import { RouteMiddleware } from '@/app/api/friends/[friendId]/middleware';
import { ApiResponse, RouteContext, RemoveFriendResponse } from '@/types';
import { getSocketIO } from '@/types/socket';
import { emitFriendRemoved } from '@/socket/server/events/friend';

export const DELETE = RouteMiddleware<RemoveFriendResponse>(async (request: NextRequest, context?: RouteContext) => {
  try {
    const friendId: string = (await context!.params).friendId!;
    const result = await removeFriend(request.user!.id!, friendId);

    const io = getSocketIO();
    if (io) {
      emitFriendRemoved(io, result.userId, result.friendId, {
        userId: result.userId,
        friendId: result.friendId,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json<ApiResponse<RemoveFriendResponse>>({
      success: true,
      message: 'Friend removed successfully',
      data: { message: 'Friend removed successfully' }
    }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove friend';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;

    return NextResponse.json<ApiResponse<RemoveFriendResponse>>({
      success: false,
      message: errorMessage,
      error: error
    }, { status: statusCode });
  }
});

