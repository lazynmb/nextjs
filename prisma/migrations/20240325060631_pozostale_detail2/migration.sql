/*
  Warnings:

  - Added the required column `pozostaleDetail` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pozostaleDetail` to the `ResultUncomplete` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "pozostaleDetail" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "ResultUncomplete" ADD COLUMN     "pozostaleDetail" JSONB NOT NULL;
