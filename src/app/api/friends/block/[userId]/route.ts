import { NextRequest, NextResponse } from "next/server";
import { blockUser, unblockUser } from "@/app/api/friends/block/[userId]/service";
import { RouteMiddleware } from '@/app/api/friends/block/[userId]/middleware';
import { ApiResponse, RouteContext, BlockUserResponse } from '@/types';
import { getSocketIO } from '@/types/socket';
import { emitFriendBlock, emitFriendUnblock } from '@/socket/server/events/friend';

export const POST = RouteMiddleware<BlockUserResponse>(async (request: NextRequest, context?: RouteContext) => {
  try {
    const targetUserId: string = (await context!.params).userId!;
    const result = await blockUser(request.user!.id!, targetUserId);

    const io = getSocketIO();
    if (io) {
      emitFriendBlock(io, result.blockedId, {
        blockerId: result.blockerId,
        blockedId: result.blockedId,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json<ApiResponse<BlockUserResponse>>({
      success: true,
      message: 'User blocked successfully',
      data: { message: 'User blocked successfully' }
    }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to block user';
    const statusCode = errorMessage.includes('Cannot block yourself') ? 400 : errorMessage.includes('already blocked') ? 409 : 500;

    return NextResponse.json<ApiResponse<BlockUserResponse>>({
      success: false,
      message: errorMessage,
      error: error
    }, { status: statusCode });
  }
});

export const DELETE = RouteMiddleware<BlockUserResponse>(async (request: NextRequest, context?: RouteContext) => {
  try {
    const targetUserId: string = (await context!.params).userId!;
    const result = await unblockUser(request.user!.id!, targetUserId);

    const io = getSocketIO();
    if (io) {
      emitFriendUnblock(io, result.blockedId, {
        blockerId: result.blockerId,
        blockedId: result.blockedId,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json<ApiResponse<BlockUserResponse>>({
      success: true,
      message: 'User unblocked successfully',
      data: { message: 'User unblocked successfully' }
    }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to unblock user';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;

    return NextResponse.json<ApiResponse<BlockUserResponse>>({
      success: false,
      message: errorMessage,
      error: error
    }, { status: statusCode });
  }
});

