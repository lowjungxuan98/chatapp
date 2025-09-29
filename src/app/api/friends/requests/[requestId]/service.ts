import { prisma } from '@/lib/config/prisma';

const userSelect = { select: { id: true, name: true, image: true } };

const getFriendRequest = async (requestId: string) => {
  const request = await prisma.friendRelation.findUnique({
    where: { id: requestId },
    include: { user: userSelect, friend: userSelect },
  });
  if (!request) throw new Error('Friend request not found');
  if (request.status !== 'PENDING') throw new Error('Friend request is not pending');
  return request;
};

export const acceptFriendRequest = async (userId: string, requestId: string) => {
  const friendRequest = await getFriendRequest(requestId);
  if (friendRequest.friendId !== userId) {
    throw new Error('You are not authorized to accept this request');
  }
  return await prisma.friendRelation.update({
    where: { id: requestId },
    data: { status: 'ACCEPTED' },
    include: { user: userSelect, friend: userSelect },
  });
};

export const declineFriendRequest = async (userId: string, requestId: string) => {
  const friendRequest = await getFriendRequest(requestId);
  if (friendRequest.friendId !== userId) {
    throw new Error('You are not authorized to decline this request');
  }
  await prisma.friendRelation.delete({ where: { id: requestId } });
  return friendRequest;
};

export const cancelFriendRequest = async (userId: string, requestId: string) => {
  const friendRequest = await getFriendRequest(requestId);
  if (friendRequest.userId !== userId) {
    throw new Error('You are not authorized to cancel this request');
  }
  await prisma.friendRelation.delete({ where: { id: requestId } });
  return friendRequest;
};

