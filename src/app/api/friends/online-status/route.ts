import { NextRequest, NextResponse } from "next/server";
import { getOnlineStatus } from "@/app/api/friends/online-status/service";
import { RouteMiddleware } from '@/app/api/friends/online-status/middleware';
import type { ApiResponse } from '@/types';
import type { OnlineStatusResponse, OnlineStatusBodyData } from '@/types/friend/online-status';

export const POST = RouteMiddleware<OnlineStatusResponse>(async (request: NextRequest) => {
  try {
    const body = await request.json() as OnlineStatusBodyData;
    const statuses = await getOnlineStatus(body.userIds);

    return NextResponse.json<ApiResponse<OnlineStatusResponse>>({
      success: true,
      message: 'Online status retrieved successfully',
      data: { statuses }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json<ApiResponse<OnlineStatusResponse>>({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve online status',
      error: error
    }, { status: 500 });
  }
});

