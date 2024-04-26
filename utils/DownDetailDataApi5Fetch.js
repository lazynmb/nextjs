export default async function pobranieDanych(year, month) {
  console.log("Fetching data for DOCHODY year and month:", year, month);
  try {
    const globalData = {
      apiDataFirst: null,
      apiDataSecond: null,
      apiDataThird: null,
      salariesData: null,
      invoicesData: null,
    };

    const fetchData = async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Problem with fetching data from ${url}`);
      }
      return response.json();
    };

    let calculatedMonth = month;
    let calculatedYear = year;

    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // 1. Zapytanie do API dla pierwszego zestawu danych
    console.log("API1");
    globalData.apiDataFirst = await fetchData(
      `api/databaseFetchData?year=${calculatedYear}&month=${calculatedMonth
        .toString()
        .padStart(2, "0")}`
    );

    // 2. zapytanie do API i wyliczenie następnego miesiąca i roku dla apiDataSecond
    calculatedMonth = calculatedMonth === 12 ? 1 : calculatedMonth + 1;
    calculatedYear =
      calculatedMonth === 1 ? calculatedYear + 1 : calculatedYear;
    globalData.apiDataSecond = await fetchData(
      `api/databaseFetchData?year=${calculatedYear}&month=${calculatedMonth
        .toString()
        .padStart(2, "0")}`
    );
    console.log("API2", calculatedMonth, calculatedYear);

    // 3. zapytanie do API i wyliczenie następnego miesiąca i roku dla apiDataThird
    calculatedMonth = month; //resetujemy wartość miesiąca
    calculatedYear = year; //resetujemy wartość roku
    if (calculatedMonth >= 11) {
      // Jeśli jest listopad lub grudzień
      calculatedMonth = calculatedMonth === 11 ? 1 : 2; // Ustaw na styczeń lub luty
      calculatedYear += 1; // Rok musi się zwiększyć, gdy przekraczamy grudzień
    } else {
      calculatedMonth += 2; // W innym przypadku dodaj dwa miesiące
    }
    globalData.apiDataThird = await fetchData(
      `api/databaseFetchData?year=${calculatedYear}&month=${calculatedMonth
        .toString()
        .padStart(2, "0")}`
    );
    console.log("API3", calculatedMonth, calculatedYear);

    // 4. zapytanie do API i wyliczenie następnego miesiąca i roku dla salariesData
    calculatedMonth = month;
    calculatedYear = year;
    calculatedMonth = calculatedMonth === 12 ? 1 : calculatedMonth + 1;
    calculatedYear =
      calculatedMonth === 1 ? calculatedYear + 1 : calculatedYear;
    globalData.salariesData = await fetchData(
      `api/supabaseSalariesMonth?year=${calculatedYear}&month=${calculatedMonth
        .toString()
        .padStart(2, "0")}`
    );

    // 5. zapytanie do API i wyliczenie następnego miesiąca i roku dla invoicesData
    calculatedMonth = month;
    calculatedYear = year;
    calculatedMonth = calculatedMonth === 12 ? 1 : calculatedMonth + 1;
    calculatedYear =
      calculatedMonth === 1 ? calculatedYear + 1 : calculatedYear;
    globalData.invoicesData = await fetchData(
      `api/supabaseInvoicesMonth?year=${calculatedYear}&month=${calculatedMonth
        .toString()
        .padStart(2, "0")}`
    );

    return globalData;
  } catch (error) {
    console.error("Error during data fetching: ", error);
  }
}
