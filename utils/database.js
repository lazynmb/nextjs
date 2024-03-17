// utils/database.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function saveToDatabase(data) {

  await prisma.result.create({
    data: {
      fileName: data.changeFileName,
      calcFromPairsResult: data.calcFromPairsResult,
      calcFromNegativePairsResult: data.calcFromNegativePairsResult,
      categoriesResult: data.categoriesResults, // Upewnij się, że to pole jest poprawnie przetwarzane
      totalIncome: data.totalIncome,
      totalExpensesCat: data.totalExpensesCat, // Załóżmy, że to jest obiekt JSON
    },
  });
  console.log('Data saved');
}


// export async function saveToDatabaseUncomplete(data) {

//   await prisma.resultUncomplete.create({
//     data: {
//       fileName: changeFileName,
//       calcFromPairsResult: data.calcFromPairsResult,
//       calcFromNegativePairsResult: data.calcFromNegativePairsResult,
//       categoriesResult: data.categoriesResults, // Upewnij się, że to pole jest poprawnie przetwarzane
//       totalIncome: data.totalIncome,
//       totalExpensesCat: data.totalExpensesCat, // Załóżmy, że to jest obiekt JSON
//     },
//   });
//   console.log('Data saved');
// }
