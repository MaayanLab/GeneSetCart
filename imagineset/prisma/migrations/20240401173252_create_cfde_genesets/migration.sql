-- CreateTable
CREATE TABLE "cfde_genesets" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "library" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "cfde_genesets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CFDEGeneSetToGene" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CFDEGeneSetToGene_AB_unique" ON "_CFDEGeneSetToGene"("A", "B");

-- CreateIndex
CREATE INDEX "_CFDEGeneSetToGene_B_index" ON "_CFDEGeneSetToGene"("B");

-- AddForeignKey
ALTER TABLE "_CFDEGeneSetToGene" ADD CONSTRAINT "_CFDEGeneSetToGene_A_fkey" FOREIGN KEY ("A") REFERENCES "cfde_genesets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CFDEGeneSetToGene" ADD CONSTRAINT "_CFDEGeneSetToGene_B_fkey" FOREIGN KEY ("B") REFERENCES "genes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
