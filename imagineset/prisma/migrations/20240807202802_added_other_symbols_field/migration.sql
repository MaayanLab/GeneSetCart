-- AlterTable
ALTER TABLE "gene_lists" ADD COLUMN     "isHumanGenes" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "otherSymbols" TEXT[] DEFAULT ARRAY[]::TEXT[];
