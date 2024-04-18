import React, { useState, useEffect } from "react";
import Modal from "../components/modal";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ monthData }) => {

    const updateChartState = (data) => {
    setApiDataFirst(data.apiDataFirst);
    setApiDataSecond(data.apiDataSecond);
    setApiDataThird(data.apiDataThird);
    setSalariesData(data.salariesData);
    setSupabase2Data(data.supabase2Data);
    // Tutaj możesz także aktualizować dane wykresu, etc.
  };

  const [apiDataFirst, setApiDataFirst] = useState({});
  const [apiDataSecond, setApiDataSecond] = useState({});
  const [apiDataThird, setApiDataThird] = useState({});
  const [salariesData, setSalariesData] = useState([]);
  const [supabase2Data, setSupabase2Data] = useState([]);
  const [chartData, setChartData] = useState({

    datasets: [
      {
        label: "Kwota",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });
  const [detailsToShow, setDetailsToShow] = useState({});
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (monthData.year && monthData.month) {
      updateChartData(monthData.year, monthData.month);
    }
  }, [monthData]);

  const saveDataToCache = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Data saved to cache with key ${key}`);
  };


  const updateChartData = async (year, month) => {

    year = parseInt(year);
    month = parseInt(month);
    const storageKey = `chartData-${year}-${month}`;
    setHasError(false); // Reset stanu błędu przed pobraniem danych

    try {
      const cachedData = localStorage.getItem(storageKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        console.log("Using cached data for:", storageKey);
        updateChartState(parsedData);
        return;
      }

      const responses = await Promise.all([
        fetch(`/api/databaseFetchData?year=${year}&month=${month}`),
        month === 12 ? 
          fetch(`/api/databaseFetchData?year=${year+1}&month=01`) : 
          fetch(`/api/databaseFetchData?year=${year}&month=${month+1}`),
        month === 12 ? 
          fetch(`/api/databaseFetchData?year=${year+1}&month=02`) : 
          fetch(`/api/databaseFetchData?year=${year}&month=${month+2}`),
        fetch(`/api/supabaseSalariesMonth?year=${year}&month=${month}`),
        month === 12 ? 
          fetch(`/api/supabaseInvoicesMonth?year=${year+1}&month=01`) :
          fetch(`/api/supabaseInvoicesMonth?year=${year}&month=${month+1}`)
      ]);

      const [apiData1, apiData2, apiData3, salaryData, supabaseData2] = await Promise.all(responses.map(res => res.json()));

      console.log("Fetched data:", apiData1[0], apiData2, apiData3, salaryData, supabaseData2);

      const combinedData = {
        apiDataFirst: apiData1[0],
        apiDataSecond: apiData2[0],
        apiDataThird: apiData3[0],
        salariesData: salaryData,
        supabase2Data: supabaseData2
      };
  
      updateChartState(combinedData);

      console.log('dan sa tu', apiDataFirst.totalExpensesCat.pozostaleWplywy)

      const przychodBrutto =
      parseFloat(apiDataFirst.totalExpensesCat.pozostaleWplywy) +
      parseFloat(apiDataFirst.totalExpensesCat.bramka) +
      parseFloat(supabaseData2.totalVatValue);

      let zaplaconyVatProjekcja = undefined;
      if (apiDataThird === undefined) { 
        zaplaconyVatProjekcja = parseFloat(((przychodBrutto - (przychodBrutto / 1.19)) * -1).toFixed(2))};

      let zaplaconyVatSuma = typeof zaplaconyVatProjekcja === 'number' ? zaplaconyVatProjekcja : parseFloat(apiDataThird.totalExpensesCat.zaplaconyVat);

      const kosztaBrutto = 
      parseFloat(apiDataSecond.totalExpensesCat.wyplaty) +
      zaplaconyVatSuma +
      parseFloat(apiDataFirst.totalExpensesCat.czynsze) +
      parseFloat(apiDataSecond.totalExpensesCat.dochodowy) +
      parseFloat(apiDataSecond.totalExpensesCat.zus) +
      parseFloat(apiDataFirst.totalExpensesCat.subskrypcje) +
      parseFloat(apiDataFirst.totalExpensesCat.uslugi) +
      parseFloat(apiDataFirst.totalExpensesCat.pozostale);
      console.log("Koszta brutto:", kosztaBrutto);

      const sumOfSalaries =
      salaryData.reduce((sum, current) => sum + current.amount, 0) / 100;



      console.log('balblalblal', apiDataFirst.totalExpensesCat)

      // Przygotowanie nowych danych na podstawie kluczy z totalExpensesCat
      const dataWithLabels = [
        {
          label: "Pozostałe wpływy",
          value: apiDataFirst.totalExpensesCat.pozostaleWplywy,
        },
        { label: "Opłacona bramka", value: apiDataFirst.totalExpensesCat.bramka },
        {
          label: "Wystawione FV (nieopłacone)",
          value: supabaseData2.totalVatValue,
        },
        {
          label: "Przychód brutto (bramka + pozostałe wpływy + wystawione FV)",
          value: przychodBrutto,
        },
        {
          label: "Pełne koszta (konto)",
          value: kosztaBrutto * -1,
        },
        { label: "Pensje m+1", value: apiDataSecond.totalExpensesCat.wyplaty * -1 },
        {
          label: typeof zaplaconyVatProjekcja === 'number' ? "VAT m+2 (PROJEKCJA 19%)" : "VAT m+2",
          value: typeof zaplaconyVatProjekcja === 'number' ? zaplaconyVatProjekcja * -1 : parseFloat(apiDataThird.totalExpensesCat.zaplaconyVat) * -1,
        },
        { label: "Czynsze", value: apiDataFirst.totalExpensesCat.czynsze * -1 },
        {
          label: "Dochodowy m+1",
          value: apiDataSecond.totalExpensesCat.dochodowy * -1,
        },
        { label: "ZUS + PIT m+1", value: apiDataSecond.totalExpensesCat.zus * -1 },
        { label: "Subskrypcje", value: apiDataFirst.totalExpensesCat.subskrypcje * -1 },
        { label: "Usługi", value: apiDataFirst.totalExpensesCat.uslugi * -1 },
        { label: "Pozostałe", value: apiDataFirst.totalExpensesCat.pozostale * -1 },
      ];

      const labels = dataWithLabels.map((item) => item.label);
      const newData = dataWithLabels.map((item) => item.value);

      const backgroundColors = labels.map((_, index) => {
        // Sprawdzamy, czy jesteśmy przy szóstym słupku (index === 5) i czy zaplaconyVatProjekcja jest liczbą
        if (index === 6 && typeof zaplaconyVatProjekcja === 'number') return "rgba(255, 0, 0, 0.2)"; // Bardziej czerwony
        else if (index <= 3) return "rgba(54, 162, 235, 0.2)"; // Niebieski
        else return "rgba(255, 99, 132, 0.2)"; // Czerwony
      });
      
      const borderColors = labels.map((_, index) => {
        // Sprawdzamy, czy jesteśmy przy szóstym słupku (index === 5) i czy zaplaconyVatProjekcja jest liczbą
        if (index === 6 && typeof zaplaconyVatProjekcja === 'number') return "rgba(255, 0, 0, 1)"; // Bardziej czerwony
        else if (index <= 3) return "rgba(54, 162, 235, 1)"; // Niebieski
        else return "rgba(255, 99, 132, 1)"; // Czerwony
      });

      // Aktualizacja danych wykresu
      setChartData((prevState) => ({
        ...prevState,
        labels: labels, // Aktualizacja etykiet
        datasets: [
          {
            ...prevState.datasets[0],
            data: newData,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
          },
        ],
      }));
    } catch (error) {
      console.error("Fetching data failed:", error);
      setHasError(true); // Ustaw stan błędu, jeśli wystąpi problem podczas pobierania danych
    }
  };



  const detailMapping = {
    "Opłacona bramka": { detailKey: "bramkaDetail", source: "first" },
    "Pensje m+1": { detailKey: "wyplatyDetail", source: "second" },
    "VAT m+2": { detailKey: "zaplaconyVatDetail", source: "fourth" },
    Czynsze: { detailKey: "czynszeDetail", source: "first" },
    "Dochodowy m+1": { detailKey: "dochodowyDetail", source: "second" },
    "ZUS + PIT m+1": { detailKey: "zusDetail", source: "second" },
    Subskrypcje: { detailKey: "subskrypcjeDetail", source: "first" },
    Usługi: { detailKey: "uslugiDetail", source: "first" },
    Pozostałe: { detailKey: "pozostaleDetail", source: "first" },
    Firmy: { detailKey: "platnosciFirmyDetail", source: "first" },
    "Pozostałe wpływy": { detailKey: "pozostaleWplywyDetail", source: "first" },
    "Wystawione FV (nieopłacone)": { detailKey: "transformedInvoicesData", source: "third" },
  };

  const options = {
    onClick: (event, elements) => {
      console.log("Clicked on chart");

      if (elements.length > 0) {
        const { index } = elements[0];
        const label = chartData.labels[index];
        console.log(`Clicked label: ${label}`);

        const mappingInfo = detailMapping[label];
        console.log(`Mapping info for label: ${label}`, mappingInfo);

        if (mappingInfo) {
          let detailSource;
          if (mappingInfo.source === "first") {
            detailSource = apiDataFirst.categoriesResult.allExpDetail;
          } else if (mappingInfo.source === "second") {
            detailSource = apiDataSecond.categoriesResult.allExpDetail;
          } else if (mappingInfo.source === "third") {
            detailSource = supabase2Data;
          } else {
            detailSource = apiDataThird.categoriesResult.allExpDetail;
          }
          console.log(`Detail source for label: ${label}`, detailSource);

          const details = detailSource[mappingInfo.detailKey];
          console.log(`Details to show for label: ${label}`, details);

          if (details) {
            setDetailsToShow(details);
          } else {
            console.error(`No details found for label: ${label}`);
          }
        } else {
          console.error(`No mapping info found for label: ${label}`);
        }
      } else {
        console.log("No chart element was clicked");
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const formatCurrency = (value) => `${value} zł`;

  const renderDetails = (details) => {
    // Assuming details is an object with arrays of numbers as values
    const sortedDetailsKeys = Object.keys(details).sort((a, b) => {
      const sumA = details[a].reduce((acc, curr) => acc + curr, 0);
      const sumB = details[b].reduce((acc, curr) => acc + curr, 0);
      return sumA - sumB; // For ascending order
    });

    return (
      <table style={{ width: "100%", border: "1px solid black" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black" }}>Category</th>
            <th style={{ border: "1px solid black" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {sortedDetailsKeys.map((key) =>
            details[key].map((amount, index) => (
              <tr key={`${key}-${index}`}>
                {index === 0 ? (
                  <td
                    style={{ border: "1px solid black" }}
                    rowSpan={details[key].length}
                  >
                    {key}
                  </td>
                ) : null}
                <td style={{ border: "1px solid black" }}>
                  {formatCurrency(amount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    );
  };

  if (hasError) {
    return (
      <>
        <div>Brak danych dla wskazanego okresu.</div>
        
      </>
    );
  }

  return (
    <>

      <Bar data={chartData} options={options} />
      {detailsToShow && Object.keys(detailsToShow).length > 0 && (
        <Modal title="Szczegóły" onClose={() => setDetailsToShow({})}>
          {renderDetails(detailsToShow)}
        </Modal>
      )}
    </>
  );
};

export default BarChart;
