import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import calculateAverageExpenses from '../../utils/calculateAverageExpenses';

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

    let calculatedMonth = month;
    let calculatedYear = year;

    console.log('funkcja wysyla ', month, year)

    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // 1. Zapytanie do API dla pierwszego zestawu danych
    globalData.apiDataFirst = await fetchData(`${baseURL}api/databaseFetchData?year=${calculatedYear}&month=${calculatedMonth}`);

    // 2. zapytanie do API i wyliczenie następnego miesiąca i roku dla apiDataSecond
    calculatedMonth = calculatedMonth === 12 ? 1 : calculatedMonth + 1;
    calculatedYear = calculatedMonth === 1 ? calculatedYear + 1 : calculatedYear;
    globalData.apiDataSecond = await fetchData(`${baseURL}api/databaseFetchData?year=${calculatedYear}&month=${calculatedMonth.toString().padStart(2, '0')}`);

    // 3. zapytanie do API i wyliczenie następnego miesiąca i roku dla apiDataThird
    calculatedMonth = month; //resetujemy wartość miesiąca
    calculatedYear = year; //resetujemy wartość roku
    if (calculatedMonth >= 11) { // Jeśli jest listopad lub grudzień
      calculatedMonth = calculatedMonth === 11 ? 1 : 2; // Ustaw na styczeń lub luty
      calculatedYear += 1; // Rok musi się zwiększyć, gdy przekraczamy grudzień
    } else {
      calculatedMonth += 2; // W innym przypadku dodaj dwa miesiące
    }
    globalData.apiDataThird = await fetchData(`${baseURL}api/databaseFetchData?year=${calculatedYear}&month=${calculatedMonth.toString().padStart(2, '0')}`);

    // 4. zapytanie do API i wyliczenie następnego miesiąca i roku dla salariesData
    calculatedMonth = month;
    calculatedYear = year;
    calculatedMonth = calculatedMonth === 12 ? 1 : calculatedMonth + 1;
    calculatedYear = calculatedMonth === 1 ? calculatedYear + 1 : calculatedYear;
    globalData.salariesData = await fetchData(`${baseURL}api/supabaseSalariesMonth?year=${calculatedYear}&month=${calculatedMonth.toString().padStart(2, '0')}`);

    // 5. zapytanie do API i wyliczenie następnego miesiąca i roku dla invoicesData
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
  // Funkcja pomocnicza do bezpiecznego parsowania i logowania brakujących danych
  let dataMissing = false;  // flaga, że brakuje danych

  async function parseOrLog(value, label) {
      if (value !== null && value !== undefined) {
          return parseFloat(parseFloat(value).toFixed(2));
      } else {
          console.log(`Brak danych dla: ${label}`);
          dataMissing = true;  // Ustawiamy flagę na true, gdy brakuje danych
          const average = await calculateAverageExpenses(label);  // Wywołanie funkcji obliczającej średnią
          return parseFloat(average); 
      }
  }

  let przychodBrutto = 0;
  przychodBrutto += await parseOrLog(globalData.apiDataFirst[0]?.totalExpensesCat.pozostaleWplywy, 'pozostaleWplywy');
  przychodBrutto += await parseOrLog(globalData.apiDataFirst[0]?.totalExpensesCat.bramka, 'bramka');
  przychodBrutto += await parseOrLog(globalData.invoicesData?.totalVatValue, 'VAT z faktur');

  let kosztaBrutto = 0;
  kosztaBrutto += await parseOrLog(globalData.apiDataSecond[0]?.totalExpensesCat.wyplaty, 'wyplaty');
  kosztaBrutto += await parseOrLog(globalData.apiDataThird[0]?.totalExpensesCat.zaplaconyVat, 'zaplaconyVat');
  kosztaBrutto += await parseOrLog(globalData.apiDataFirst[0]?.totalExpensesCat.czynsze, 'czynsze');
  kosztaBrutto += await parseOrLog(globalData.apiDataSecond[0]?.totalExpensesCat.dochodowy, 'dochodowy');
  kosztaBrutto += await parseOrLog(globalData.apiDataSecond[0]?.totalExpensesCat.zus, 'zus');
  kosztaBrutto += await parseOrLog(globalData.apiDataFirst[0]?.totalExpensesCat.subskrypcje, 'subskrypcje');
  kosztaBrutto += await parseOrLog(globalData.apiDataFirst[0]?.totalExpensesCat.uslugi, 'uslugi');
  kosztaBrutto += await parseOrLog(globalData.apiDataFirst[0]?.totalExpensesCat.pozostale, 'pozostałe koszty');

  console.log('przychód brutto:', przychodBrutto, 'koszta brutto:', kosztaBrutto);

  let dochodBrutto = przychodBrutto + kosztaBrutto;

  // Zaokrąglenie dochodu brutto do 2 miejsc po przecinku
  dochodBrutto = parseFloat(dochodBrutto.toFixed(2));

  console.log('przychód brutto:', przychodBrutto, 'koszta brutto:', kosztaBrutto, 'dochód brutto:', dochodBrutto);
  return {
    dochodBrutto: dochodBrutto,
    isComplete: !dataMissing  // Jeśli dataMissing jest false, isComplete będzie true
};
}

export default async function  przetwarzajDaneIZapisz() {
  try {
    const results = await prisma.result.findMany({
        orderBy: [
            { fileName: 'desc' },
        ],
        take: 12,
    });


    for (const result of results) {
        await pobranieDanych(result.year, result.month);
        const { dochodBrutto, isComplete } = await sumujDaneIRaportujZysk();  // Odebranie obu wartości

        await prisma.dochod.create({
            data: {
                year: result.year,
                month: result.month,
                amount: dochodBrutto,
                isDataComplete: isComplete  // Użycie flagi isComplete
            },
        });
    }

    console.log("Dane za ostatnie 12 miesięcy zostały przetworzone i zapisane.");
  } catch (error) {
    console.error("Błąd podczas przetwarzania danych: ", error);
  }
}


