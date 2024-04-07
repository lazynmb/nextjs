import { PrismaClient } from '@prisma/client';
import { list, del } from '@vercel/blob';
import { saveToDatabase } from '../../utils/database';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

export default async function getMonthlyProfit (req, res) {
    try {
        const results = await prisma.results.findMany({
          orderBy: [
            {
              year: 'desc',
            },
            {
              month: 'desc',
            },
          ],
          take: 14, // Pobiera 14 ostatnich rekordów, zakładając, że chcesz pominąć dwa najnowsze i zacząć od trzeciego
        });
    
        // Logika do obsługi pominięcia dwóch najnowszych rekordów i pracy z ostatnimi 12 miesiącami
        const last12MonthsResults = results.slice(2); // Pomija dwa najnowsze rekordy
  
      for (let result of last12MonthsResults) {
        const { year, month } = result;
        
        // Zakładam, że getPrihodIKoszty jest twoją funkcją, która zwraca przychód i koszty dla danego miesiąca
        const { przychod, koszty } = await getPrihodIKoszty(year, month);
        const profit = przychod - koszty;
      const response = await fetch(
        `/api/databaseFetchData?year=${selectedYear}&month=${selectedMonth}`
      );
      if (!response.ok) {
        throw new Error("Problem with fetching data");
      }
      const fetchedData = await response.json();

      // Drugie zapytanie do tego samego API z innymi parametrami
      const monthAdd1 = `${parseInt(selectedMonth) + 1}`.padStart(2, "0");
      const monthAdd2 = `${parseInt(selectedMonth) + 2}`.padStart(2, "0");
      const yearAdd1 = parseInt(selectedYear) + 1;

      let responseAPI2;
      if (selectedMonth === "12") {
        responseAPI2 = await fetch(
          `/api/databaseFetchData?year=${yearAdd1}&month=01`
        );
        if (!responseAPI2.ok) {
          throw new Error("Problem with fetching data from second API call");
        }
      } else {
        responseAPI2 = await fetch(
          `/api/databaseFetchData?year=${selectedYear}&month=${monthAdd1}`
        );
        if (!responseAPI2.ok) {
          throw new Error("Problem with fetching data from second API call");
        }
      }
      const fetchedDataAPI2 = await responseAPI2.json();

      let responseAPI3;
      if (selectedMonth === "12") {
        responseAPI3 = await fetch(
          `/api/databaseFetchData?year=${yearAdd1}&month=02`
        );
        if (!responseAPI3.ok) {
          throw new Error("Problem with fetching data from second API call");
        }
      } else if (selectedMonth === "11") {
        responseAPI3 = await fetch(
          `/api/databaseFetchData?year=${selectedYear}&month=01`
        );
        if (!responseAPI3.ok) {
          throw new Error("Problem with fetching data from second API call");
        }
      } else {
        responseAPI3 = await fetch(
          `/api/databaseFetchData?year=${selectedYear}&month=${monthAdd2}`
        );
        if (!responseAPI3.ok) {
          throw new Error("Problem with fetching data from second API call");
        }
      }
      const fetchedDataAPI3 = await responseAPI3.json();

      // trzecie zapytanie do API Supabase

      const responseSupabase = await fetch(
        `/api/supabaseSalariesMonth?year=${selectedYear}&month=${selectedMonth}`
      );
      const dataSupabase = await responseSupabase.json();

      let responseSupabase2;
      if (selectedMonth === "12") {
        responseSupabase2 = await fetch(
          `/api/supabaseInvoicesMonth?year=${yearAdd1}&month=01`
        );
        if (!responseSupabase2.ok) {
          throw new Error("Problem with fetching data from second API call");
        }
      } else {
        responseSupabase2 = await fetch(
          `/api/supabaseInvoicesMonth?year=${selectedYear}&month=${monthAdd1}`
        );
        if (!responseSupabase2.ok) {
          throw new Error("Problem with fetching data from second API call");
        }
      }

      const dataSupabase2 = await responseSupabase2.json();

      // Zakładamy, że API zwraca tablicę obiektów i interesuje nas pierwszy element
      const data = fetchedData[0];
      console.log("Data from first API call:", data);
      const data2 = fetchedDataAPI2[0];
      console.log("Data from second API call:", data2);
      const data3 = fetchedDataAPI3[0];
      console.log("Data from third API call:", data3);

      setApiDataFirst(data);
      setApiDataSecond(data2);
      setApiDataThird(data3);
      setSalariesData(dataSupabase);
      const sumOfSalaries =
        dataSupabase.reduce((sum, current) => sum + current.amount, 0) / 100;
      console.log("Sum of salaries:", sumOfSalaries);
      console.log("Data from Supabase:", dataSupabase);
      console.log("Data from Supabase:", dataSupabase2);

      const przychodBrutto =
        parseFloat(data.totalExpensesCat.pozostaleWplywy) +
        parseFloat(data.totalExpensesCat.bramka) +
        parseFloat(dataSupabase2.totalVatValue);
      console.log("Przychód brutto:", przychodBrutto);
      const kosztaBrutto = 
        parseFloat(data2.totalExpensesCat.wyplaty) +
        parseFloat(data3.totalExpensesCat.zaplaconyVat) +
        parseFloat(data.totalExpensesCat.czynsze) +
        parseFloat(data2.totalExpensesCat.dochodowy) +
        parseFloat(data2.totalExpensesCat.zus) +
        parseFloat(data.totalExpensesCat.subskrypcje) +
        parseFloat(data.totalExpensesCat.uslugi) +
        parseFloat(data.totalExpensesCat.pozostale);