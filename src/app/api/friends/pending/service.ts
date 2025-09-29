import { prisma } from '@/lib/config/prisma';
import type { GetPendingRequestsQueryData } from '@/types/friend';

export const getPendingRequests = async (userId: string, query: GetPendingRequestsQueryData) => {
  const { type, limit, offset } = query;
  const whereClause = type === 'received' 
    ? { friendId: userId, status: 'PENDING' as const } 
    : { userId, status: 'PENDING' as const };

  const [total, requests] = await Promise.all([
    prisma.friendRelation.count({ where: whereClause }),
    prisma.friendRelation.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, image: true } },
        friend: { select: { id: true, name: true, image: true } },
      },
    }),
  ]);

  return { requests, total, limit, offset, type };
};

