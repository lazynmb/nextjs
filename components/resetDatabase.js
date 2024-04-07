import React, { useState } from 'react';

function ResetDatabaseButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResetDatabase = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const resetResponse = await fetch('/api/removeDuplicateFilesAndProcess', { method: 'POST' });
      if (!resetResponse.ok) {
        throw new Error('Problem z resetowaniem bazy danych.');
      }
      const resetResult = await resetResponse.json();

      // Drugie zapytanie do API: Pobieranie zysków miesięcznych
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
        {isLoading ? 'Trwa resetowanie...' : 'Resetuj bazę danych'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetDatabaseButton;
