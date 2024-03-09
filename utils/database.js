// utils/database.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function saveToDatabase(data) {
  await prisma.result.create({
    data: {
      calcFromPairsResult: parseFloat(data.calcFromPairsResult.totalNet),
      calcFromNegativePairsResult: parseFloat(data.calcFromNegativePairsResult.totalNewNettoNegative),
      categoriesResult: data.categoriesResults, // Upewnij się, że to pole jest poprawnie przetwarzane
      totalIncome: parseFloat(data.totalIncome.totalIncome),
      totalExpensesCat: data.totalExpensesCat, // Załóżmy, że to jest obiekt JSON
    },
  });
}
