import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { year, month } = req.query;
  console.log('Database fetch data: fetching data for year and month:', year, month);

  if (!year || !month) {
    return res.status(400).json({ message: 'Missing required query parameters: year and month' });
  }

  try {
    // Pobieranie danych z bazy w oparciu o przekazany rok i miesiąc
    const results = await prisma.result.findMany({
      where: {
        AND: [
          { year: parseInt(year, 10) }, // Konwersja na liczbę
          { month: parseInt(month, 10) } // Konwersja na liczbę
        ]
      },
      select: {
        // Tutaj określasz, które kolumny chcesz zwrócić z pasujących wierszy.
        // Na przykład, jeśli chcesz zwrócić wszystkie dane z wiersza:
        calcFromPairsResult: true,
        calcFromNegativePairsResult: true,
        categoriesResult: true,
        totalIncome: true,
        totalExpensesCat: true,
        // Dodaj resztę kolumn, które chcesz zwrócić
      },
    });

    // Zwracanie danych jako odpowiedź JSON
    res.status(200).json(results);
  } catch (error) {
    console.error('Error accessing the database:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
