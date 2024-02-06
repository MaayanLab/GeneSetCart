-- CreateTable
CREATE TABLE "genes" (
    "id" TEXT NOT NULL,
    "gene_symbol" TEXT NOT NULL,
    "synonyms" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "genes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gene_lists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "session_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gene_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GeneToGeneSet" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "gene_lists_session_id_name_key" ON "gene_lists"("session_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "_GeneToGeneSet_AB_unique" ON "_GeneToGeneSet"("A", "B");

-- CreateIndex
CREATE INDEX "_GeneToGeneSet_B_index" ON "_GeneToGeneSet"("B");

-- AddForeignKey
ALTER TABLE "gene_lists" ADD CONSTRAINT "gene_lists_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "user_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneToGeneSet" ADD CONSTRAINT "_GeneToGeneSet_A_fkey" FOREIGN KEY ("A") REFERENCES "genes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneToGeneSet" ADD CONSTRAINT "_GeneToGeneSet_B_fkey" FOREIGN KEY ("B") REFERENCES "gene_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
