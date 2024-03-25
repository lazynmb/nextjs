import { list, del } from '@vercel/blob';

export default async function removeDuplicateFiles(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN, // Zakładam, że TOKEN jest poprawnie ustawiony
    });

    if (response.blobs && Array.isArray(response.blobs)) {
      const fileMap = new Map();

      // Iteruj przez wszystkie pliki, rejestrując je w Mapie zgodnie z nazwą pliku
      response.blobs.forEach(blob => {
        if (!fileMap.has(blob.pathname)) {
          fileMap.set(blob.pathname, [blob.downloadUrl]);
        } else {
          fileMap.get(blob.pathname).push(blob.downloadUrl);
        }
      });

      // Przetwarzaj każdą nazwę pliku w Mapie
      for (const [pathname, urls] of fileMap) {
        // Jeśli znajduje się więcej niż jeden URL dla tej samej nazwy pliku, oznacza to duplikat
        if (urls.length > 1) {
          // Usuwaj wszystkie oprócz pierwszego URL (zachowaj jeden plik)
          for (let i = 1; i < urls.length; i++) {
            // Usuń duplikat
            await del(urls[i], {
              token: process.env.BLOB_READ_WRITE_TOKEN
            });
            console.log(`Usunięto duplikat pliku: ${pathname}`);
          }
        }
      }

      res.status(200).json({ message: 'Duplikaty zostały usunięte' });
    } else {
      throw new Error("Expected 'blobs' property to be an array");
    }
  } catch (error) {
    console.error('Failed to remove duplicates:', error);
    res.status(500).json({ error: 'Failed to remove duplicate files' });
  }
}
