import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { category } = req.query;

  try {
    // Pobierz 3 ostatnie rekordy
    const results = await prisma.result.findMany({
      take: 3,
      orderBy: {
        fileName: 'desc'
      },
    });


    if (results.length === 0) {
      console.log("Nie znaleziono rekordów.");
      return;
    }

    let sum = 0;
    let count = 0;

    results.forEach(result => {
      const value = result.totalExpensesCat[category];
      console.log(`Wartość dla kategorii ${category}:`, value);
      if (value) {
        const numericValue = parseFloat(value.replace(/,/g, '')); // Usuwa przecinki i konwertuje string na float
        if (!isNaN(numericValue)) {
          sum += numericValue;
          count++;
        }
      }
    });

    if (count === 0) {
      console.log(`Brak danych dla kategorii: ${category}`);
      return;
    }

    const average = (sum / count).toFixed(2); // Zaokrąglenie do dwóch miejsc po przecinku
    console.log(`Średni wydatek dla kategorii ${category}:`, average);
    res.status(200).json({ average });  // Wysyłanie odpowiedzi JSON z obliczoną średnią
  } catch (error) {
    console.error("Błąd podczas przetwarzania danych:", error);
    res.status(500).send("Wewnętrzny błąd serwera");  // Wysyłanie odpowiedzi HTTP z kodem 500
  }
}