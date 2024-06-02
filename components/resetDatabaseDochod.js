import React, { useState } from 'react';

function ResetDatabaseDochodButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResetDatabase = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // Drugie zapytanie do API: Pobieranie zysków miesięcznych
      const reset = await fetch('/api/apiResetDatabaseDochod', { method: 'POST' });
      if (!reset.ok) {
        throw new Error('Problem z pobieraniem danych o zyskach miesięcznych.');
      }
      const resetResult = await reset.json();
      const profitResponse = await fetch('/api/getMonthlyProfit', { method: 'POST' });
      if (!profitResponse.ok) {
        throw new Error('Problem z pobieraniem danych o zyskach miesięcznych.');
      }
      const profitResult = await profitResponse.json();

      // Ustawienie wiadomości na podstawie odpowiedzi z obu zapytań
      setMessage(`Reset bazy danych: ${resetResult.message}. Zyski miesięczne: ${profitResult.message}`);
    } catch (error) {
      setMessage(error.toString());
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <button onClick={handleResetDatabase} disabled={isLoading}>
        {isLoading ? 'Trwa resetowanie...' : 'Resetuj bazę danych Wykresu Dochodów'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetDatabaseDochodButton;
