import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function resetDatabaseDochod(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await prisma.dochod.deleteMany({});
        console.log('Tabela `dochod` została zresetowana.');
        res.status(200).json({ message: 'Tabela `dochod` została zresetowana.' });
    } catch (error) {
        console.error("Błąd podczas przetwarzania danych:", error);
        res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
    } finally {
        await prisma.$disconnect();
    }
}