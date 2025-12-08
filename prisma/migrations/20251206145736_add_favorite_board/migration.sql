-- CreateTable
CREATE TABLE "FavoriteBoard" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "memberId" UUID NOT NULL,
    "boardId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteBoard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idx_favorite_board_unique" ON "FavoriteBoard"("memberId", "boardId");

-- AddForeignKey
ALTER TABLE "FavoriteBoard" ADD CONSTRAINT "FavoriteBoard_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteBoard" ADD CONSTRAINT "FavoriteBoard_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
