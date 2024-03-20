import { PrismaClient } from "@prisma/client";

prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ message: 'Missing required query parameters: year and month' });
  }

  try {
    // Pobieranie danych z bazy w oparciu o przekazany rok i miesiąc
    const results = await prisma.results.findMany({
      where: {
        year: parseInt(year, 10), // Konwersja na liczbę
        month: parseInt(month, 10), // Konwersja na liczbę
      },
      select: {
        data: true, // Dostosuj do struktury swojej bazy danych
      },
    });

    // Zwracanie danych jako odpowiedź JSON
    res.status(200).json(results);
  } catch (error) {
    console.error('Error accessing the database:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}