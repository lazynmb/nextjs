import { useState } from 'react';

interface DataType {
  calcFromPairsResult: number; // Replace 'any' with the actual type of calcFromPairsResult
  calcFromNegativePairsResult: number; // Replace 'any' with the actual type of calcFromNegativePairsResult
  categoriesResult: number; // Replace 'any' with the actual type of categoriesResult
}

export default function Page() {
  const [data, setData] = useState<DataType | null>(null);

  if (!data) {
    fetch('https://nextjs-liard-alpha-14.vercel.app/pages/api/calc', { cache: 'no-store' })
      .then(response => response.json())
      .then(fetchedData => setData(fetchedData));

    return 'Loading...';
  }

  return (
    <div>
      <h1>Data from calc.js:</h1>
      <p>calcFromPairsResult: {data.calcFromPairsResult}</p>
      <p>calcFromNegativePairsResult: {data.calcFromNegativePairsResult}</p>
      <p>categoriesResult: {data.categoriesResult}</p>
    </div>
  );
}