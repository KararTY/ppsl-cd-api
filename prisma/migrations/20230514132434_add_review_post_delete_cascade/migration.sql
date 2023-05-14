-- DropForeignKey
ALTER TABLE "PostReview" DROP CONSTRAINT "PostReview_fromPostId_fkey";

-- DropForeignKey
ALTER TABLE "PostReview" DROP CONSTRAINT "PostReview_toPostId_fkey";

-- AddForeignKey
ALTER TABLE "PostReview" ADD CONSTRAINT "PostReview_fromPostId_fkey" FOREIGN KEY ("fromPostId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReview" ADD CONSTRAINT "PostReview_toPostId_fkey" FOREIGN KEY ("toPostId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
