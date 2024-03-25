import { list, del } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function deleteDuplicates() {
  try {
    // Pobieranie listy plików
    const files = await list();
    
    // Mapa do przechowywania już znalezionych nazw plików
    const foundNames = new Map();
    
    // Iteracja po liście plików i identyfikacja duplikatów
    for (const file of files) {
      // Zakładam, że `file.name` zawiera nazwę pliku, którą można użyć do identyfikacji duplikatów
      if (foundNames.has(file.name)) {
        // Jeśli plik o takiej samej nazwie już istnieje, usuwamy go
        await del(file.url); // Zakładając, że `file.url` zawiera pełny URL do pliku
        console.log(`Deleted duplicate file: ${file.name}`);
      } else {
        // Jeśli to pierwsze wystąpienie pliku, dodajemy go do mapy
        foundNames.set(file.name, true);
      }
    }
    
    return new Response('Deleted duplicates', { status: 200 });
  } catch (error) {
    console.error('Error deleting duplicate files:', error);
    return new Response('Error deleting duplicate files', { status: 500 });
  }
}
