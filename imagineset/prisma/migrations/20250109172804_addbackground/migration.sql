-- AlterTable
ALTER TABLE "added_genesets" ADD COLUMN     "background" TEXT;

-- CreateTable
CREATE TABLE "added_backgrounds" (
    "hash" TEXT NOT NULL,
    "genes" TEXT[],

    CONSTRAINT "added_backgrounds_pkey" PRIMARY KEY ("hash")
);

-- CreateIndex
CREATE UNIQUE INDEX "added_backgrounds_hash_key" ON "added_backgrounds"("hash");
