-- AlterTable
ALTER TABLE "added_genesets" ADD COLUMN     "otherSymbols" TEXT[] DEFAULT ARRAY[]::TEXT[];
