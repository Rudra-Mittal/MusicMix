/*
  Warnings:

  - A unique constraint covering the columns `[videoId,userName]` on the table `Stream` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Stream_url_key";

-- DropIndex
DROP INDEX "Stream_videoId_key";

-- AlterTable
ALTER TABLE "Stream" ALTER COLUMN "active" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Stream_videoId_userName_key" ON "Stream"("videoId", "userName");
