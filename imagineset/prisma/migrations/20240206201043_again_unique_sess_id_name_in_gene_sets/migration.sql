/*
  Warnings:

  - A unique constraint covering the columns `[session_id,name]` on the table `gene_lists` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "gene_lists_session_id_name_key" ON "gene_lists"("session_id", "name");
