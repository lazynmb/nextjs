import { useEffect, useState } from 'react';

const Page = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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
      {/* Renderuj swoje dane */}
    </div>
  );
};

export default Page;