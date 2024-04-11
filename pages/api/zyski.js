import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export default async function handler(req, res) {
    try {
      const zyski = await prisma.dochod.findMany({

            orderBy: [
              { year: 'asc' },
              { month: 'asc' },
            ],
            take: 12,
        });
        res.status(200).json(zyski);
        console.log('Zyski:', zyski);
      } catch (error) {
        console.error(error); // Dla celów debugowania
        res.status(500).json({ message: "Nie udało się pobrać danych", error: error.message });
    } finally {
        // Zawsze wykonuj czynności zamykania połączenia z bazą danych
        await prisma.$disconnect();
    }
    }