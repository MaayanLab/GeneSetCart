/*
  Warnings:

  - Added the required column `n_genes1` to the `cfde_cross_pair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `n_genes2` to the `cfde_cross_pair` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cfde_cross_pair" ADD COLUMN     "n_genes1" INTEGER NOT NULL,
ADD COLUMN     "n_genes2" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "tempSessions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "genesetName" TEXT NOT NULL,
    "genes" TEXT[],

    CONSTRAINT "tempSessions_pkey" PRIMARY KEY ("id")
);
