import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { parseHtmlAndExtractData, calcFromPairs, calcFromNegativePairs, countIncome, categories, sumExpensesByCategory } from './calc';
import { saveToDatabase } from '../../utils/database';
import { Storage } from '@google-cloud/storage';

const prisma = new PrismaClient();

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});


export const config = {
  api: {
    bodyParser: true, // Włączamy obsługę bodyParsera, aby móc odczytać dane JSON.
  },
};

export default async function handler(req, res) {
  // Sprawdzamy, czy metoda to POST
  if (req.method === 'POST') {
    try {
      // Odczytujemy nazwę pliku z ciała żądania
      const { fileName } = req.body;
      console.log(`Nazwa pliku: ${fileName}`);

      const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(fileName);

      const [buffer] = await file.download(); // Pobieranie zawartości pliku jako bufor
      const content = buffer.toString('utf-8'); 

      // Przetwarzanie pliku...
      const { positivePairs, negativePairs } = parseHtmlAndExtractData(content);
      const calcFromPairsResult = calcFromPairs(positivePairs);
      const calcFromNegativePairsResult = calcFromNegativePairs(negativePairs, positivePairs);
      const categoriesResults = await categories(content);
      const totalIncome = countIncome(calcFromPairsResult.totalNet, calcFromNegativePairsResult.totalNewNettoNegative);
      const totalAllExp = await categories(content);
      const totalExpensesCat = sumExpensesByCategory(totalAllExp);

      // Zapisz wyniki do bazy danych
      await saveToDatabase({
        fileName,
        calcFromPairsResult,
        calcFromNegativePairsResult,
        categoriesResults,
        totalIncome,
        totalAllExp,
        totalExpensesCat,
      });

      console.log(`Przetworzono plik: ${fileName}`);
      res.status(200).json({ message: 'File processed successfully.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error during file processing' });
    }
  } else {
    // Jeśli metoda nie jest POST, zwracamy błąd
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
