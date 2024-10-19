/*
  Warnings:

  - You are about to drop the column `userId` on the `Stream` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userName` to the `Stream` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Stream" DROP CONSTRAINT "Stream_userId_fkey";

-- AlterTable
ALTER TABLE "Stream" DROP COLUMN "userId",
ADD COLUMN     "userName" TEXT NOT NULL,
ADD COLUMN     "votesCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_userName_fkey" FOREIGN KEY ("userName") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
