import { checkIfFullMonth, fileName, parseHtmlAndExtractData, calcFromPairs, calcFromNegativePairs, countIncome, categories, sumExpensesByCategory } from './calc';
import { saveToDatabase } from '../../utils/database';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log(req.body);
    const { downloadUrl } = req.body;
    console.log(`Pobieranie pliku: ${downloadUrl}`);

    // Pobierz plik z Vercel Blob
    const fileResponse = await fetch(downloadUrl);
    if (!fileResponse.ok) {
      throw new Error(`Nie udało się pobrać pliku: ${downloadUrl}`);
    }


      // Przetwarzanie pliku...
      const { positivePairs, negativePairs } = await parseHtmlAndExtractData(downloadUrl);
      const changeFileName = await fileName(downloadUrl);
      console.log(`Nazwa pliku po zmianie: ${changeFileName}`);
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
      res.status(200).json({ message: 'Plik został przetworzony i wyslany do bazy danych.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }}