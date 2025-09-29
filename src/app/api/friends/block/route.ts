import { NextRequest, NextResponse } from "next/server";
import { getBlockList } from "@/app/api/friends/block/service";
import { RouteMiddleware } from '@/app/api/friends/block/middleware';
import { ApiResponse, GetBlockListResponse, GetBlockListQueryData } from '@/types';

export const GET = RouteMiddleware<GetBlockListResponse>(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const query: GetBlockListQueryData = {
      search: url.searchParams.get('search') || undefined,
      limit: parseInt(url.searchParams.get('limit') || '50', 10),
      offset: parseInt(url.searchParams.get('offset') || '0', 10),
      sortBy: (url.searchParams.get('sortBy') as 'createdAt' | 'name') || 'createdAt',
      order: (url.searchParams.get('order') as 'asc' | 'desc') || 'desc',
    };

    const result = await getBlockList(request.user!.id!, query);

    return NextResponse.json<ApiResponse<GetBlockListResponse>>({
      success: true,
      message: 'Block list retrieved successfully',
      data: result
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json<ApiResponse<GetBlockListResponse>>({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve block list',
      error: error
    }, { status: 500 });
  }
});

