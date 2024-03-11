/*
  Warnings:

  - The primary key for the `Result` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Result` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileName]` on the table `Result` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `calcFromPairsResult` on the `Result` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `calcFromNegativePairsResult` on the `Result` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `totalIncome` on the `Result` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Result" DROP CONSTRAINT "Result_pkey",
DROP COLUMN "id",
DROP COLUMN "calcFromPairsResult",
ADD COLUMN     "calcFromPairsResult" JSONB NOT NULL,
DROP COLUMN "calcFromNegativePairsResult",
ADD COLUMN     "calcFromNegativePairsResult" JSONB NOT NULL,
DROP COLUMN "totalIncome",
ADD COLUMN     "totalIncome" JSONB NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Result_fileName_key" ON "Result"("fileName");
