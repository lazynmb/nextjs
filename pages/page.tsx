import { GetServerSideProps } from 'next';
import fetch from 'node-fetch';

export default function Page({ data }: { data: any }) {
  return (
    <div>
      <h1>Data from calc.js:</h1>
      <p>calcFromPairsResult: {data.calcFromPairsResult}</p>
      <p>calcFromNegativePairsResult: {data.calcFromNegativePairsResult}</p>
      <p>categoriesResult: {data.categoriesResult}</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // Fetch data from ./pages/api/calc.js
  const res = await fetch('https://nextjs-liard-alpha-14.vercel.app/pages/api/calc');
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
};