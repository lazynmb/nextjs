import { useState, useEffect } from 'react';

interface DataType {
  calcFromPairsResult: number; // Replace 'any' with the actual type of calcFromPairsResult
  calcFromNegativePairsResult: number; // Replace 'any' with the actual type of calcFromNegativePairsResult
  categoriesResult: number; // Replace 'any' with the actual type of categoriesResult
}




export default function Page() {
  const [data, setData] = useState({ calcFromPairsResult: null, calcFromNegativePairsResult: null, categoriesResult: null });

  useEffect(() => {
    fetch('/api/calc')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error("Failed to fetch data:", error));
  }, []);

  if (!data.calcFromPairsResult) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Data from calc.js:</h1>
      <p>calcFromPairsResult - Total Net: {(data.calcFromPairsResult as any).totalNet}</p>
      <p>calcFromPairsResult - Total VAT: {(data.calcFromPairsResult as any).totalVAT}</p>
      <p>calcFromPairsResult - Total Brutto: {(data.calcFromPairsResult as any).totalBrutto}</p>
    </div>
  );
}