const fs = require('fs');


// Wczytaj dane z pliku JSON
const calcFromPairsResult = require('ścieżka/do/calcFromPairsResult.json');
const calcFromNegativePairsResult = require('ścieżka/do/calcFromNegativePairsResult.json');
const categoriesResult = require('ścieżka/do/categoriesResult.json');

const Page = () => {
  return (
      <div>
          <h1>Wyniki Obliczeń</h1>
          <h2>Wynik z pary: {calcFromPairsResult}</h2>
          <h2>Wynik z ujemnych par: {calcFromNegativePairsResult}</h2>
          <h2>Wynik kategorii: {categoriesResult}</h2>
      </div>
  );
};

export default Page;

// Zapisz dane do pliku ./page.tsx
fs.writeFileSync('./page.tsx', `
    export const calcFromPairsResult = ${JSON.stringify(calcFromPairsResult)};
    export const calcFromNegativePairsResult = ${JSON.stringify(calcFromNegativePairsResult)};
    export const categoriesResult = ${JSON.stringify(categoriesResult)};
`);