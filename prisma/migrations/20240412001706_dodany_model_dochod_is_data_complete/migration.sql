/*
  Warnings:

  - Added the required column `isDataComplete` to the `Dochod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dochod" ADD COLUMN     "isDataComplete" BOOLEAN NOT NULL;
