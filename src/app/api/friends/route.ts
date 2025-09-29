import { NextRequest, NextResponse } from "next/server";
import { getFriendsList } from "@/app/api/friends/service";
import { RouteMiddleware } from '@/app/api/friends/middleware';
import { ApiResponse, GetFriendsListResponse, GetFriendsQueryData } from '@/types';

export const GET = RouteMiddleware<GetFriendsListResponse>(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const query: GetFriendsQueryData = {
      status: (url.searchParams.get('status') as 'ACCEPTED' | 'DECLINED' | 'PENDING') || undefined,
      search: url.searchParams.get('search') || undefined,
      limit: parseInt(url.searchParams.get('limit') || '50', 10),
      offset: parseInt(url.searchParams.get('offset') || '0', 10),
      sortBy: (url.searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'name') || 'createdAt',
      order: (url.searchParams.get('order') as 'asc' | 'desc') || 'desc',
    };

    const result = await getFriendsList(request.user!.id!, query);

    return NextResponse.json<ApiResponse<GetFriendsListResponse>>({
      success: true,
      message: 'Friends list retrieved successfully',
      data: result
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json<ApiResponse<GetFriendsListResponse>>({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve friends list',
      error: error
    }, { status: 500 });
  }
});

