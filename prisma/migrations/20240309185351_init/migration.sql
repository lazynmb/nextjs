-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "calcFromPairsResult" DOUBLE PRECISION NOT NULL,
    "calcFromNegativePairsResult" DOUBLE PRECISION NOT NULL,
    "categoriesResult" DOUBLE PRECISION NOT NULL,
    "totalIncome" DOUBLE PRECISION NOT NULL,
    "totalExpensesCat" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedFile" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedFile_fileName_key" ON "ProcessedFile"("fileName");
