import React from 'react';
import calculateAverageExpenses from '../utils/calculateAverageExpenses';

const testButton = () => {
  const handleCalculate = () => {
    calculateAverageExpenses('zus');
  };

  return (
    <button onClick={handleCalculate}>
      Calculate Average Expenses
    </button>
  );
};

export default testButton;