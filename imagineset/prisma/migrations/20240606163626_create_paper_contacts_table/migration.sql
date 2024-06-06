-- CreateTable
CREATE TABLE "paper_contacts" (
    "id" TEXT NOT NULL,
    "pmcid" TEXT NOT NULL,
    "article_title" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "given_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "paper_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "paper_contacts_pmcid_email_key" ON "paper_contacts"("pmcid", "email");
