-- DropForeignKey
ALTER TABLE "gene_lists" DROP CONSTRAINT "gene_lists_session_id_fkey";

-- CreateTable
CREATE TABLE "cfde_cross_pair" (
    "id" TEXT NOT NULL,
    "lib_1" TEXT NOT NULL,
    "lib_2" TEXT NOT NULL,
    "geneset_1" TEXT NOT NULL,
    "geneset_2" TEXT NOT NULL,
    "odds_ratio" DOUBLE PRECISION NOT NULL,
    "pvalue" DOUBLE PRECISION NOT NULL,
    "n_overlap" INTEGER NOT NULL,
    "overlap" TEXT[],

    CONSTRAINT "cfde_cross_pair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lib_abstracts" (
    "id" TEXT NOT NULL,
    "lib" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,

    CONSTRAINT "lib_abstracts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "gene_lists" ADD CONSTRAINT "gene_lists_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "user_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
