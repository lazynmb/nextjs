import React, { useState } from 'react';

function ResetDatabaseButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResetDatabase = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/removeDuplicateFilesAndProcess', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        setMessage(result.message);
      } else {
        throw new Error('Problem z resetowaniem bazy danych.');
      }
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
