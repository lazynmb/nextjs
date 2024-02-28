import React from 'react';
import { calculate } from './pages/app/calc';

export const HomePage = () => {
  const result = calculate(); // Wywołanie funkcji calculate z pliku calc.js

  return (
    <div>
      <h1>Wyniki kalkulacji:</h1>
      <p>{result}</p>
    </div>
  );
};

export default HomePage;