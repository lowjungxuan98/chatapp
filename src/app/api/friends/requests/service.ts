import { prisma } from '@/lib/config/prisma';

export const sendFriendRequest = async (userId: string, targetUserId: string) => {
  if (userId === targetUserId) {
    throw new Error('Cannot send friend request to yourself');
  }

  const [targetUser, blockRelation, existingRelation] = await Promise.all([
    prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, image: true },
    }),
    prisma.blockRelation.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: targetUserId },
          { blockerId: targetUserId, blockedId: userId },
        ],
      },
    }),
    prisma.friendRelation.findFirst({
      where: {
        OR: [
          { userId, friendId: targetUserId },
          { userId: targetUserId, friendId: userId },
        ],
      },
    }),
  ]);

  if (!targetUser) throw new Error('Target user not found');
  if (blockRelation) throw new Error('Cannot send friend request to blocked user');
  if (existingRelation?.status === 'PENDING') throw new Error('Friend request already exists');
  if (existingRelation?.status === 'ACCEPTED') throw new Error('Already friends with this user');

  return await prisma.friendRelation.create({
    data: { userId, friendId: targetUserId, status: 'PENDING' },
    include: {
      user: { select: { id: true, name: true, image: true } },
      friend: { select: { id: true, name: true, image: true } },
    },
  });
};

