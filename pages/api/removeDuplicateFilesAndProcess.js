import { PrismaClient } from '@prisma/client';
import { list, del } from '@vercel/blob';
import { checkIfFullMonth, fileName, parseHtmlAndExtractData, calcFromPairs, calcFromNegativePairs, countIncome, categories, sumExpensesByCategory } from './calc';
import { saveToDatabase } from '../../utils/database';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

export default async function removeDuplicateFilesAndProcess(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await prisma.result.deleteMany({});
    console.log('Tabela `result` została zresetowana.');
    await prisma.resultUncomplete.deleteMany({});
    console.log('Tabela `resultUncomplete` została zresetowana.');

    const response = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (response.blobs && Array.isArray(response.blobs)) {
      const fileMap = new Map();

      response.blobs.forEach(blob => {
        const pathname = blob.pathname;
        if (!fileMap.has(pathname)) {
          fileMap.set(pathname, [blob]);
        } else {
          fileMap.get(pathname).push(blob);
        }
      });

      for (const [pathname, blobs] of fileMap.entries()) {
        if (blobs.length > 1) {
          for (let i = 1; i < blobs.length; i++) {
            await del(blobs[i].url, {
              token: process.env.BLOB_READ_WRITE_TOKEN,
            });
            console.log(`Usunięto duplikat pliku: ${pathname}`);
          }
        }

        const downloadUrl = blobs[0].downloadUrl;
        console.log(`Pobieranie i przetwarzanie pliku: ${downloadUrl}`);
        
        const fileResponse = await fetch(downloadUrl);
        if (!fileResponse.ok) {
          throw new Error(`Nie udało się pobrać pliku: ${downloadUrl}`);
        }

        // Tutaj wklejamy kod przetwarzania pliku
        const { positivePairs, negativePairs } = await parseHtmlAndExtractData(downloadUrl);
        const changeFileName = await fileName(downloadUrl);
        const calcFromPairsResult = calcFromPairs(positivePairs);
        const calcFromNegativePairsResult = calcFromNegativePairs(negativePairs, positivePairs);
        const categoriesResults = await categories(downloadUrl);
        const totalIncome = countIncome(calcFromPairsResult.totalNet, calcFromNegativePairsResult.totalNewNettoNegative);
        const totalAllExp = await categories(downloadUrl);
        const totalExpensesCat = sumExpensesByCategory(totalAllExp);
        const isFullMonth = await checkIfFullMonth(downloadUrl);

        // Zapisz wyniki do bazy danych
        await saveToDatabase({
          isFullMonth,
          changeFileName,
          calcFromPairsResult,
          calcFromNegativePairsResult,
          categoriesResults,
          totalIncome,
          totalAllExp,
          totalExpensesCat,
        });

        console.log('Plik został przetworzony i wysłany do bazy danych.');
      }

      res.status(200).json({ message: 'Duplikaty zostały usunięte, wszystkie pliki przetworzone i wysłane do bazy danych.' });
    } else {
      throw new Error("Expected 'blobs' property to be an array");
    }
  } catch (error) {
    console.error('Failed to process files after removing duplicates:', error);
    res.status(500).json({ error: 'Failed to process files after removing duplicates' });
  }
}
