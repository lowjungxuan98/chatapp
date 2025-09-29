import { prisma } from '@/lib/config/prisma';

const userSelect = { select: { id: true, name: true, image: true } };

export const blockUser = async (userId: string, targetUserId: string) => {
  if (userId === targetUserId) throw new Error('Cannot block yourself');

  const existingBlock = await prisma.blockRelation.findUnique({
    where: { blockerId_blockedId: { blockerId: userId, blockedId: targetUserId } },
  });

  if (existingBlock) throw new Error('User is already blocked');

  return await prisma.$transaction(async (tx) => {
    const blockRelation = await tx.blockRelation.create({
      data: { blockerId: userId, blockedId: targetUserId },
      include: { blocker: userSelect, blocked: userSelect },
    });

    await tx.friendRelation.deleteMany({
      where: {
        OR: [
          { userId, friendId: targetUserId },
          { userId: targetUserId, friendId: userId },
        ],
      },
    });

    return blockRelation;
  });
};

export const unblockUser = async (userId: string, targetUserId: string) => {
  const blockRelation = await prisma.blockRelation.findUnique({
    where: { blockerId_blockedId: { blockerId: userId, blockedId: targetUserId } },
    include: { blocker: userSelect, blocked: userSelect },
  });

  if (!blockRelation) throw new Error('Block relation not found');

  await prisma.blockRelation.delete({ where: { id: blockRelation.id } });
  return blockRelation;
};

