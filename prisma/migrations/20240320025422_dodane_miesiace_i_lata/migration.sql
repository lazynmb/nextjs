/*
  Warnings:

  - Added the required column `month` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `ResultUncomplete` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `ResultUncomplete` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ResultUncomplete" ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;
