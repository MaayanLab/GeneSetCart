/*
  Warnings:

  - You are about to drop the `_CFDEGeneSetToGene` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CFDEGeneSetToGene" DROP CONSTRAINT "_CFDEGeneSetToGene_A_fkey";

-- DropForeignKey
ALTER TABLE "_CFDEGeneSetToGene" DROP CONSTRAINT "_CFDEGeneSetToGene_B_fkey";

-- DropTable
DROP TABLE "_CFDEGeneSetToGene";

-- CreateTable
CREATE TABLE "_GeneTocfdegeneset" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GeneTocfdegeneset_AB_unique" ON "_GeneTocfdegeneset"("A", "B");

-- CreateIndex
CREATE INDEX "_GeneTocfdegeneset_B_index" ON "_GeneTocfdegeneset"("B");

-- AddForeignKey
ALTER TABLE "_GeneTocfdegeneset" ADD CONSTRAINT "_GeneTocfdegeneset_A_fkey" FOREIGN KEY ("A") REFERENCES "genes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneTocfdegeneset" ADD CONSTRAINT "_GeneTocfdegeneset_B_fkey" FOREIGN KEY ("B") REFERENCES "cfde_genesets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
