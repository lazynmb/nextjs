import { useEffect, useState } from 'react';

const Page = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/calc');
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        const newData = await res.json();
        setData(newData);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>Wyniki</h1>
      <table>
        <thead>
          <tr>
            <th>Klucz</th>
            <th>Wartość</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
