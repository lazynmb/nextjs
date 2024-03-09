import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import path from 'path';
import fs from 'fs';

import { parseHtmlAndExtractData, calcFromPairs, calcFromNegativePairs, countIncome, categories, sumExpensesByCategory } from './calc'; // Załóżmy, że funkcje przetwarzające są zdefiniowane w tym pliku
import { saveToDatabase } from '../../utils/database'; // Funkcja pomocnicza do zapisu danych do bazy

export default async function handler(req, res) {
    try {
        console.log('Przetwarzanie danych rozpoczęte...');
        const directoryPath = path.join(process.cwd(), 'Doks/miesiace');
        const files = fs.readdirSync(directoryPath);
    
        for (const file of files) {
          const filePath = path.join(directoryPath, file);
    
          // Sprawdź, czy plik jest już przetworzony
          const alreadyProcessed = await prisma.processedFile.findUnique({
            where: {
              fileName: file,
            },
          });
    
          if (!alreadyProcessed && fs.statSync(filePath).isFile()) {
            // Przetwarzanie pliku
            const { positivePairs, negativePairs } = parseHtmlAndExtractData(filePath);
            const calcFromPairsResult = calcFromPairs(positivePairs);
            const calcFromNegativePairsResult = calcFromNegativePairs(negativePairs, positivePairs);
            const categoriesResults = await categories(filePath);
            const totalIncome = countIncome(calcFromPairsResult.totalNet, calcFromNegativePairsResult.totalNewNettoNegative);
            const totalAllExp = categories(filePath);
            const totalExpensesCat = sumExpensesByCategory(totalAllExp);
    
            // Zapisz wyniki do bazy danych (upewnij się, że masz odpowiednie funkcje/metody do obsługi tego)
            await saveToDatabase({
                calcFromPairsResult,
                calcFromNegativePairsResult,
                categoriesResults,
                totalIncome,
                totalAllExp,
                totalExpensesCat,
              });
            // Tu przykładowo zapisujemy, że plik został przetworzony
            await prisma.processedFile.create({
              data: {
                fileName: file,
                // Możesz dodać więcej danych, jakie chcesz zapisać
              },
            });
    
            console.log(`Przetworzono plik: ${file}`);
          }
        }
    
        res.status(200).json({ message: 'Przetwarzanie zakończone.' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
    // Zapisz wyniki do bazy danych
    
