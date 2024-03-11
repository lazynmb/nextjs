// pages/api/getDataForMonth.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export default async function handler(req, res) {
  // Odczytaj fileName z query
  const { fileName } = req.query;

  try {
    const data = await prisma.result.findMany({
      where: {
        fileName,
      },
    });
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: 'Data not found for the specified fileName' });
    }
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Error fetching data for fileName' });
  }
}
