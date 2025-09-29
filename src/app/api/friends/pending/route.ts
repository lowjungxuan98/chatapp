import { NextRequest, NextResponse } from "next/server";
import { getPendingRequests } from "@/app/api/friends/pending/service";
import { RouteMiddleware } from '@/app/api/friends/pending/middleware';
import { ApiResponse, GetPendingRequestsResponse, GetPendingRequestsQueryData } from '@/types';

export const GET = RouteMiddleware<GetPendingRequestsResponse>(async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const query: GetPendingRequestsQueryData = {
      type: url.searchParams.get('type') as 'received' | 'sent',
      limit: parseInt(url.searchParams.get('limit') || '50', 10),
      offset: parseInt(url.searchParams.get('offset') || '0', 10),
    };

    const result = await getPendingRequests(request.user!.id!, query);

    return NextResponse.json<ApiResponse<GetPendingRequestsResponse>>({
      success: true,
      message: 'Pending requests retrieved successfully',
      data: result
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json<ApiResponse<GetPendingRequestsResponse>>({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve pending requests',
      error: error
    }, { status: 500 });
  }
});

