import fs from 'fs';
import path from 'path';
import { useEffect, useState } from 'react';

export default function Page({ initialData }) {
  const [data, setData] = useState(initialData);

  // Use data in your component...

  return (
    <div>
      <h1>Data from page.tsx:</h1>
      <p>calcFromPairsResult: {data.calcFromPairsResult}</p>
      <p>calcFromNegativePairsResult: {data.calcFromNegativePairsResult}</p>
      <p>categoriesResult: {data.categoriesResult}</p>
    </div>
  );
}

export async function getServerSideProps() {
  const filePath = path.join(process.cwd(), 'page.tsx');
  const fileData = fs.readFileSync(filePath, 'utf8');
  const initialData = JSON.parse(fileData);

  return {
    props: {
      initialData,
    },
  };
}