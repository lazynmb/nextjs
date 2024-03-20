// utils/database.js
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function saveToDatabase(data) {
  try {
    // Najpierw sprawdzamy, czy plik o danej nazwie już istnieje
    const existingFile = await prisma.result.findUnique({
      where: {
        fileName: data.changeFileName.newFileName,
      },
    });

    // Jeśli plik już istnieje, wyświetlamy komunikat i kończymy funkcję
    if (existingFile) {
      console.log('File already exists in the database.');
      return;
    }
    
    if (data.isFullMonth) {
      // Jeśli plik nie istnieje, tworzymy nowy wpis
      await prisma.result.create({
        data: {
          fileName: data.changeFileName.newFileName,
          month: data.changeFileName.month,
          year: data.changeFileName.year,
          calcFromPairsResult: data.calcFromPairsResult,
          calcFromNegativePairsResult: data.calcFromNegativePairsResult,
          categoriesResult: data.categoriesResults,
          totalIncome: data.totalIncome,
          totalExpensesCat: data.totalExpensesCat,
        },
      });

      console.log('Data saved successfully.');
    } else {
      await prisma.resultUncomplete.create({
        data: {
          fileName: data.changeFileName.newFileName,
          month: data.changeFileName.month,
          year: data.changeFileName.year,
          calcFromPairsResult: data.calcFromPairsResult,
          calcFromNegativePairsResult: data.calcFromNegativePairsResult,
          categoriesResult: data.categoriesResults, // Upewnij się, że to pole jest poprawnie przetwarzane
          totalIncome: data.totalIncome,
          totalExpensesCat: data.totalExpensesCat, // Załóżmy, że to jest obiekt JSON
        },
      });
      console.log('Data saved');
    }
  } catch (error) {
    console.error('Error saving data:', error);
  }
}
