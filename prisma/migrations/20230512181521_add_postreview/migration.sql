-- CreateEnum
CREATE TYPE "PostReviewTypes" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateTable
CREATE TABLE "PostReview" (
    "id" TEXT NOT NULL,
    "type" "PostReviewTypes" NOT NULL,
    "userId" TEXT NOT NULL,
    "fromPostId" TEXT,
    "toPostId" TEXT NOT NULL,

    CONSTRAINT "PostReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostReview_fromPostId_key" ON "PostReview"("fromPostId");

-- AddForeignKey
ALTER TABLE "PostReview" ADD CONSTRAINT "PostReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReview" ADD CONSTRAINT "PostReview_fromPostId_fkey" FOREIGN KEY ("fromPostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReview" ADD CONSTRAINT "PostReview_toPostId_fkey" FOREIGN KEY ("toPostId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
