use client;

import { useEffect, useState } from 'react';

const Page = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Upewnij się, że ścieżka jest poprawna i dostępna z kontekstu, w którym jest wywoływana.
      // Na przykład, podczas pracy lokalnie, może być potrzebne pełne URL do API.
      const res = await fetch('/api/calc');
      const newData = await res.json();
      setData(newData);
    };

    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>Wyniki</h1>
      {/* Renderowanie danych */}
    </div>
  );
};

export default Page;