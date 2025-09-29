import { prisma } from '@/lib/config/prisma';

export const removeFriend = async (userId: string, friendId: string) => {
  const friendship = await prisma.friendRelation.findFirst({
    where: {
      OR: [
        { userId, friendId, status: 'ACCEPTED' },
        { userId: friendId, friendId: userId, status: 'ACCEPTED' },
      ],
    },
  });

  if (!friendship) throw new Error('Friendship not found');

  await prisma.friendRelation.delete({ where: { id: friendship.id } });

  return { userId: friendship.userId, friendId: friendship.friendId };
};

