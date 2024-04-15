/*
  Warnings:

  - You are about to drop the `tempSessions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `private` to the `user_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_sessions" ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT TRUE;

-- DropTable
DROP TABLE "tempSessions";
