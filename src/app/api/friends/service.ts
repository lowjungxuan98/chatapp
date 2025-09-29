import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/config/prisma';
import type { GetFriendsQueryData } from '@/types/friend';

export const getFriendsList = async (userId: string, query: GetFriendsQueryData) => {
  const { status, search, limit, offset, sortBy = 'createdAt', order = 'desc' } = query;

  const baseConditions: Prisma.FriendRelationWhereInput[] = [
    { userId, status: status || 'ACCEPTED' },
    { friendId: userId, status: status || 'ACCEPTED' },
  ];

  const whereClause: Prisma.FriendRelationWhereInput = search
    ? {
        AND: [
          { OR: baseConditions },
          {
            OR: [
              { user: { name: { contains: search, mode: 'insensitive' } } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
              { friend: { name: { contains: search, mode: 'insensitive' } } },
              { friend: { email: { contains: search, mode: 'insensitive' } } },
            ],
          },
        ],
      }
    : { OR: baseConditions };

  const orderByClause: Prisma.FriendRelationOrderByWithRelationInput | Prisma.FriendRelationOrderByWithRelationInput[] =
    sortBy === 'name'
      ? [{ user: { name: order } }, { friend: { name: order } }]
      : { [sortBy]: order };

  const [total, friendRelations] = await Promise.all([
    prisma.friendRelation.count({ where: whereClause }),
    prisma.friendRelation.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy: orderByClause,
      include: {
        user: { select: { id: true, name: true, image: true } },
        friend: { select: { id: true, name: true, image: true } },
      },
    }),
  ]);

  const friends = friendRelations.map((relation) =>
    relation.userId === userId
      ? relation
      : { ...relation, user: relation.friend, friend: relation.user }
  );

  return { friends, total, limit, offset };
};

