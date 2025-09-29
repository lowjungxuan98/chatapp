import { prisma } from '@/lib/config/prisma';
import type { SearchUserQueryData, UserSearchResult, RelationStatus } from '@/types/friend/search-user';

export const searchUsers = async (userId: string, query: SearchUserQueryData): Promise<UserSearchResult[]> => {
  const { q, type, limit } = query;
  const takeLimit = Math.min(limit, 20);

  const whereClause = type === 'email'
    ? { email: q, id: { not: userId } }
    : { name: { contains: q, mode: 'insensitive' as const }, id: { not: userId } };

  const users = await prisma.user.findMany({
    where: whereClause,
    select: { id: true, name: true, email: true, image: true },
    take: takeLimit,
  });

  const userIds = users.map(u => u.id);

  const [friendRelations, blockRelations, blockedByRelations] = await Promise.all([
    prisma.friendRelation.findMany({
      where: {
        OR: [
          { userId, friendId: { in: userIds } },
          { userId: { in: userIds }, friendId: userId },
        ],
      },
      select: { userId: true, friendId: true, status: true },
    }),
    prisma.blockRelation.findMany({
      where: { blockerId: userId, blockedId: { in: userIds } },
      select: { blockedId: true },
    }),
    prisma.blockRelation.findMany({
      where: { blockerId: { in: userIds }, blockedId: userId },
      select: { blockerId: true },
    }),
  ]);

  const blockedSet = new Set(blockRelations.map(b => b.blockedId));
  const blockedBySet = new Set(blockedByRelations.map(b => b.blockerId));

  const relationMap = new Map<string, RelationStatus>();
  friendRelations.forEach(rel => {
    const targetId = rel.userId === userId ? rel.friendId : rel.userId;
    if (rel.status === 'ACCEPTED') {
      relationMap.set(targetId, 'friend');
    } else if (rel.status === 'PENDING') {
      relationMap.set(targetId, rel.userId === userId ? 'pending_sent' : 'pending_received');
    }
  });

  return users.map(user => {
    let relationStatus: RelationStatus = 'none';
    if (blockedSet.has(user.id)) {
      relationStatus = 'blocked';
    } else if (blockedBySet.has(user.id)) {
      relationStatus = 'blocked_by';
    } else {
      relationStatus = relationMap.get(user.id) || 'none';
    }

    return { ...user, relationStatus };
  });
};

