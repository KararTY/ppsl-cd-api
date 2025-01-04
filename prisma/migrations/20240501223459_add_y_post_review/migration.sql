-- DropForeignKey
ALTER TABLE "PostMetadata" DROP CONSTRAINT "PostMetadata_userId_fkey";

-- DropForeignKey
ALTER TABLE "PostReview" DROP CONSTRAINT "PostReview_userId_fkey";

-- CreateTable
CREATE TABLE "YPostReview" (
    "id" TEXT NOT NULL,
    "type" "PostReviewTypes" NOT NULL,
    "userId" TEXT NOT NULL,
    "fromPostId" TEXT,
    "toPostId" TEXT NOT NULL,

    CONSTRAINT "YPostReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YPostReview_fromPostId_key" ON "YPostReview"("fromPostId");

-- AddForeignKey
ALTER TABLE "YPostReview" ADD CONSTRAINT "YPostReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YPostReview" ADD CONSTRAINT "YPostReview_fromPostId_fkey" FOREIGN KEY ("fromPostId") REFERENCES "YPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YPostReview" ADD CONSTRAINT "YPostReview_toPostId_fkey" FOREIGN KEY ("toPostId") REFERENCES "YPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
