-- CreateTable
CREATE TABLE "ResultUncomplete" (
    "fileName" TEXT NOT NULL,
    "calcFromPairsResult" JSONB NOT NULL,
    "calcFromNegativePairsResult" JSONB NOT NULL,
    "categoriesResult" JSONB NOT NULL,
    "totalIncome" JSONB NOT NULL,
    "totalExpensesCat" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ResultUncomplete_fileName_key" ON "ResultUncomplete"("fileName");
