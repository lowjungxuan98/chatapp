import { prisma } from '@/lib/config/prisma';
import type { GetBlockListQueryData } from '@/types/friend';

export const getBlockList = async (userId: string, query: GetBlockListQueryData) => {
  const { search, limit, offset, sortBy = 'createdAt', order = 'desc' } = query;

  const whereClause = search
    ? {
        AND: [
          { blockerId: userId },
          {
            OR: [
              { blocked: { name: { contains: search, mode: 'insensitive' as const } } },
              { blocked: { email: { contains: search, mode: 'insensitive' as const } } },
            ],
          },
        ],
      }
    : { blockerId: userId };

  const orderByClause = sortBy === 'name' ? { blocked: { name: order } } : { [sortBy]: order };

  const [total, blockRelations] = await Promise.all([
    prisma.blockRelation.count({ where: whereClause }),
    prisma.blockRelation.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy: orderByClause,
      include: { blocked: { select: { id: true, name: true, image: true, email: true } } },
    }),
  ]);

  return { blockList: blockRelations, total, limit, offset };
};

