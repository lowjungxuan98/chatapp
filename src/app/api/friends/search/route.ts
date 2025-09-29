import { NextRequest, NextResponse } from "next/server";
import { searchUsers } from "@/app/api/friends/search/service";
import { RouteMiddleware } from '@/app/api/friends/search/middleware';
import type { ApiResponse } from '@/types';
import type { SearchUserResponse, SearchUserQueryData } from '@/types/friend/search-user';

export const GET = RouteMiddleware<SearchUserResponse>(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const query: SearchUserQueryData = {
      q: url.searchParams.get('q') || '',
      type: (url.searchParams.get('type') as 'email' | 'name') || 'name',
      limit: parseInt(url.searchParams.get('limit') || '10', 10),
    };

    const users = await searchUsers(request.user!.id!, query);

    return NextResponse.json<ApiResponse<SearchUserResponse>>({
      success: true,
      message: 'Users found successfully',
      data: { users, total: users.length }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json<ApiResponse<SearchUserResponse>>({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to search users',
      error: error
    }, { status: 500 });
  }
});

