-- DropForeignKey
ALTER TABLE "PostHistory" DROP CONSTRAINT "PostHistory_postMetadataId_fkey";

-- AddForeignKey
ALTER TABLE "PostHistory" ADD CONSTRAINT "PostHistory_postMetadataId_fkey" FOREIGN KEY ("postMetadataId") REFERENCES "PostMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
