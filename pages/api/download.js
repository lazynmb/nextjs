import { list } from '@vercel/blob'; // Zakładając, że istnieje funkcja `list` w pakiecie @vercel/blob
import deleteDuplicates from './deleteDuplicatsFromServer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    let blob = await deleteDuplicates();    

    // Pobieranie listy plików
    const files = await list(); // Użyj odpowiedniego prefixu, jeśli to konieczne

    // Tworzenie listy linków do plików
    const links = files.map(file => {
      return {
        url: blob.downloadUrl, // Zakładając, że obiekt `file` zawiera pole `url`
      };
    });

    // Zwracanie listy linków jako odpowiedź JSON
    return res.status(200).json(links);
  } catch (error) {
    console.error('Failed to retrieve files:', error);
    return res.status(500).json({ error: 'Failed to retrieve files' });
  }
}