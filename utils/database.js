// utils/database.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function saveToDatabase(data) {
  const fileNameWithoutHtml = data.fileName.replace('.html', '');

  await prisma.result.create({
    data: {
      fileName: fileNameWithoutHtml,
      calcFromPairsResult: data.calcFromPairsResult,
      calcFromNegativePairsResult: data.calcFromNegativePairsResult,
      categoriesResult: data.categoriesResults, // Upewnij się, że to pole jest poprawnie przetwarzane
      totalIncome: data.totalIncome,
      totalExpensesCat: data.totalExpensesCat, // Załóżmy, że to jest obiekt JSON
    },
  });
  console.log('Data saved');
}


export async function saveToDatabaseUncomplete(data) {
  const fileNameWithoutHtml = data.fileName.replace('.html', '');

  await prisma.resultUncomplete.create({
    data: {
      fileName: fileNameWithoutHtml,
      calcFromPairsResult: data.calcFromPairsResult,
      calcFromNegativePairsResult: data.calcFromNegativePairsResult,
      categoriesResult: data.categoriesResults, // Upewnij się, że to pole jest poprawnie przetwarzane
      totalIncome: data.totalIncome,
      totalExpensesCat: data.totalExpensesCat, // Załóżmy, że to jest obiekt JSON
    },
  });
  console.log('Data saved');
}
