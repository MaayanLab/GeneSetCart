/*
  Warnings:

  - A unique constraint covering the columns `[lib_1,lib_2,geneset_1,geneset_2]` on the table `cfde_cross_pair` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[term,library]` on the table `cfde_genesets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lib]` on the table `lib_abstracts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cfde_cross_pair_lib_1_lib_2_geneset_1_geneset_2_key" ON "cfde_cross_pair"("lib_1", "lib_2", "geneset_1", "geneset_2");

-- CreateIndex
CREATE UNIQUE INDEX "cfde_genesets_term_library_key" ON "cfde_genesets"("term", "library");

-- CreateIndex
CREATE UNIQUE INDEX "lib_abstracts_lib_key" ON "lib_abstracts"("lib");
