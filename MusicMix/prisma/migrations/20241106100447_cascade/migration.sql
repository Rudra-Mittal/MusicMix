-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_streamId_fkey";

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
