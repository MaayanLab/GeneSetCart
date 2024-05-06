-- CreateTable
CREATE TABLE "added_genesets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "added_genesets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GeneToaddedGeneset" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GeneToaddedGeneset_AB_unique" ON "_GeneToaddedGeneset"("A", "B");

-- CreateIndex
CREATE INDEX "_GeneToaddedGeneset_B_index" ON "_GeneToaddedGeneset"("B");

-- AddForeignKey
ALTER TABLE "_GeneToaddedGeneset" ADD CONSTRAINT "_GeneToaddedGeneset_A_fkey" FOREIGN KEY ("A") REFERENCES "genes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneToaddedGeneset" ADD CONSTRAINT "_GeneToaddedGeneset_B_fkey" FOREIGN KEY ("B") REFERENCES "added_genesets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
