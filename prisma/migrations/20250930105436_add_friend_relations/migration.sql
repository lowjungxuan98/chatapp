-- CreateEnum
CREATE TYPE "public"."FriendStatus" AS ENUM ('ACCEPTED', 'DECLINED', 'PENDING');

-- CreateTable
CREATE TABLE "public"."block_relations" (
    "id" TEXT NOT NULL,
    "blocker_id" TEXT NOT NULL,
    "blocked_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "block_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."friend_relations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "friend_id" TEXT NOT NULL,
    "status" "public"."FriendStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friend_relations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "block_relations_blocker_id_idx" ON "public"."block_relations"("blocker_id");

-- CreateIndex
CREATE INDEX "block_relations_blocked_id_idx" ON "public"."block_relations"("blocked_id");

-- CreateIndex
CREATE UNIQUE INDEX "block_relations_blocker_id_blocked_id_key" ON "public"."block_relations"("blocker_id", "blocked_id");

-- CreateIndex
CREATE INDEX "friend_relations_user_id_status_idx" ON "public"."friend_relations"("user_id", "status");

-- CreateIndex
CREATE INDEX "friend_relations_friend_id_status_idx" ON "public"."friend_relations"("friend_id", "status");

-- CreateIndex
CREATE INDEX "friend_relations_user_id_friend_id_status_idx" ON "public"."friend_relations"("user_id", "friend_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "friend_relations_user_id_friend_id_key" ON "public"."friend_relations"("user_id", "friend_id");

-- AddForeignKey
ALTER TABLE "public"."block_relations" ADD CONSTRAINT "block_relations_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."block_relations" ADD CONSTRAINT "block_relations_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."friend_relations" ADD CONSTRAINT "friend_relations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."friend_relations" ADD CONSTRAINT "friend_relations_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

