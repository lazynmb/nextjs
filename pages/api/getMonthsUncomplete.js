// pages/api/getMonths.js
import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  const prisma = new PrismaClient();
  try {
    const months = await prisma.resultUncomplete.findMany({
      select: {
        fileName: true
      }
    });
    res.status(200).json(months);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
}
