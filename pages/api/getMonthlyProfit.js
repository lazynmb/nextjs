import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// Globalne zmienne do przechowywania danych
let globalData = {
  apiDataFirst: null,
  apiDataSecond: null,
  apiDataThird: null,
  salariesData: null,
  invoicesData: null,
};

await prisma.dochod.deleteMany({});
console.log('Tabela `dochod` została zresetowana.');

// Funkcja do pobierania danych
async function pobranieDanych(year, month) {
  try {
    const fetchData = async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Problem with fetching data from ${url}`);
      }
      return response.json();
    };

    // Zmienna na potrzeby wyliczania kolejnych miesięcy i lat
    let calculatedMonth = month;
    let calculatedYear = year;

    // Reset globalnych danych przed każdym pobraniem
    // globalData = {
    //   apiDataFirst: null,
    //   apiDataSecond: null,
    //   apiDataThird: null,
    //   salariesData: null,
    //   invoicesData: null,
    // };


    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    // Zapytanie do API dla pierwszego zestawu danych
    
    globalData.apiDataFirst = await fetchData(`${baseURL}api/databaseFetchData?year=${calculatedYear}&month=${calculatedMonth}`);

    // Wyliczenie następnego miesiąca i roku dla apiDataSecond
    calculatedMonth = calculatedMonth === 12 ? 1 : calculatedMonth + 1;
    calculatedYear = calculatedMonth === 1 ? calculatedYear + 1 : calculatedYear;
    globalData.apiDataSecond = await fetchData(`${baseURL}api/databaseFetchData?year=${calculatedYear}&month=${calculatedMonth.toString().padStart(2, '0')}`);

    // Wyliczenie następnego miesiąca i roku dla apiDataThird
    calculatedMonth = month;
    calculatedYear = year;
// Dodawanie dwóch miesięcy
    if (calculatedMonth >= 11) { // Jeśli jest listopad lub grudzień
      calculatedMonth = calculatedMonth === 11 ? 1 : 2; // Ustaw na styczeń lub luty
      calculatedYear += 1; // Rok musi się zwiększyć, gdy przekraczamy grudzień
    } else {
      calculatedMonth += 2; // W innym przypadku dodaj dwa miesiące
    }
    globalData.apiDataThird = await fetchData(`${baseURL}api/databaseFetchData?year=${calculatedYear}&month=${calculatedMonth.toString().padStart(2, '0')}`);

    // Dla salariesData i invoicesData używamy pierwotnych wartości `year` i `month`
    calculatedMonth = month;
    calculatedYear = year;
    calculatedMonth = calculatedMonth === 12 ? 1 : calculatedMonth + 1;
    calculatedYear = calculatedMonth === 1 ? calculatedYear + 1 : calculatedYear;
    globalData.salariesData = await fetchData(`${baseURL}api/supabaseSalariesMonth?year=${calculatedYear}&month=${calculatedMonth.toString().padStart(2, '0')}`);

    calculatedMonth = month;
    calculatedYear = year;
    calculatedMonth = calculatedMonth === 12 ? 1 : calculatedMonth + 1;
    calculatedYear = calculatedMonth === 1 ? calculatedYear + 1 : calculatedYear;
    globalData.invoicesData = await fetchData(`${baseURL}api/supabaseInvoicesMonth?year=${calculatedYear}&month=${calculatedMonth.toString().padStart(2, '0')}`);

  } catch (error) {
    console.error("Error during data fetching: ", error);
  }
}


// Funkcja do sumowania danych i wyliczania dochodu
let dochodBrutto = 0;

async function sumujDaneIRaportujZysk() {    
  let przychodBrutto =
  parseFloat(globalData.apiDataFirst[0].totalExpensesCat.pozostaleWplywy) +
  parseFloat(globalData.apiDataFirst[0].totalExpensesCat.bramka) +
  parseFloat(globalData.invoicesData.totalVatValue);
const kosztaBrutto = 
  parseFloat(globalData.apiDataSecond[0].totalExpensesCat.wyplaty) +
  parseFloat(globalData.apiDataThird[0].totalExpensesCat.zaplaconyVat) +
  parseFloat(globalData.apiDataFirst[0].totalExpensesCat.czynsze) +
  parseFloat(globalData.apiDataSecond[0].totalExpensesCat.dochodowy) +
  parseFloat(globalData.apiDataSecond[0].totalExpensesCat.zus) +
  parseFloat(globalData.apiDataFirst[0].totalExpensesCat.subskrypcje) +
  parseFloat(globalData.apiDataFirst[0].totalExpensesCat.uslugi) +
  parseFloat(globalData.apiDataFirst[0].totalExpensesCat.pozostale);
  console.log('wypłaty', globalData.apiDataSecond[0].totalExpensesCat.wyplaty, 'zapłacony vat', globalData.apiDataThird[0].totalExpensesCat.zaplaconyVat, 'czynsze', globalData.apiDataFirst[0].totalExpensesCat.czynsze, 'dochodowy', globalData.apiDataSecond[0].totalExpensesCat.dochodowy, 'zus', globalData.apiDataSecond[0].totalExpensesCat.zus, 'subskrypcje', globalData.apiDataFirst[0].totalExpensesCat.subskrypcje, 'usługi', globalData.apiDataFirst[0].totalExpensesCat.uslugi, 'pozostałe', globalData.apiDataFirst[0].totalExpensesCat.pozostale);

dochodBrutto = przychodBrutto + kosztaBrutto;
console.log('przychód brutto', przychodBrutto, 'koszta brutto', kosztaBrutto, 'dochód brutto', dochodBrutto);
return dochodBrutto;

}

export default async function  przetwarzajDaneIZapisz() {
  try {
    // Pobieranie danych dla 13 ostatnich miesięcy (zakładając, że chcesz pominąć najnowszy)
    const results = await prisma.result.findMany({
      orderBy: [
        {
          fileName: 'desc',
        },
      ],
      take: 13, // Pobiera 13 rekordów, aby pominąć najnowszy i pracować z 12
    });
    

    // Pominięcie najnowszego wpisu i przetwarzanie pozostałych 12
    const last12MonthsResults = results.slice(3); // Pomija najnowszy rekord

    for (const result of last12MonthsResults) {
      // Pobranie danych za dany miesiąc
      await pobranieDanych(result.year, result.month);
      console.log(`Dane za ${result.year}-${result.month} zostały pobrane.`);

      // Tutaj wywołujesz funkcję sumującą dane i zwracającą wynik, który chcesz zapisać
      // Zakładam, że funkcja `sumujDaneIRaportujZysk` teraz zwraca wartość, którą chcesz zapisać
      const dochodBrutto = await sumujDaneIRaportujZysk();

      // Zapis wyniku do bazy danych
      await prisma.dochod.create({
        data: {
          year: result.year,
          month: result.month,
          amount: dochodBrutto,
        },
      });
    }

    console.log("Dane za ostatnie 12 miesięcy zostały przetworzone i zapisane.");
  } catch (error) {
    console.error("Błąd podczas przetwarzania danych: ", error);
  }
}


