-- CreateTable
CREATE TABLE "report" (
    "hash" TEXT NOT NULL,
    "analysisData" JSONB NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("hash")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_hash_key" ON "report"("hash");
