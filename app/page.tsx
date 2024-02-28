import React, { useState, useEffect } from 'react';
import fs from 'fs';

function Page() {
  const [data, setData] = useState({
    calcFromPairsResult: null,
    calcFromNegativePairsResult: null,
    categoriesResult: null,
  });

  useEffect(() => {
    // Odczytaj dane z pliku
    const fileData = fs.readFileSync('./page.tsx', 'utf8');

    // Przekształć dane JSON z powrotem na obiekt JavaScript
    const parsedData = JSON.parse(fileData);

    // Ustaw stan danych
    setData(parsedData);
  }, []);

  return (
    <div>
      <h1>Data from page.tsx:</h1>
      <p>calcFromPairsResult: {data.calcFromPairsResult}</p>
      <p>calcFromNegativePairsResult: {data.calcFromNegativePairsResult}</p>
      <p>categoriesResult: {data.categoriesResult}</p>
    </div>
  );
}

export default Page;