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

const BarChart = () => {
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString().padStart(2, "0")
  );
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

  const years = ["2022", "2023", "2024"];
  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  const updateChartData = async () => {
    setHasError(false); // Reset stanu błędu przed pobraniem danych
    try {
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


      const przychodBrutto =
      parseFloat(data.totalExpensesCat.pozostaleWplywy) +
      parseFloat(data.totalExpensesCat.bramka) +
      parseFloat(dataSupabase2.totalVatValue);

      let data3 = fetchedDataAPI3[0];
      let zaplaconyVatProjekcja = undefined;
      if (data3 === undefined) { 
        zaplaconyVatProjekcja = parseFloat(((przychodBrutto - (przychodBrutto / 1.19)) * -1).toFixed(2))};

      console.log("Data from third API call:", data3);

      setApiDataFirst(data);
      setApiDataSecond(data2);
      setApiDataThird(data3);
      setSalariesData(dataSupabase);
      setSupabase2Data(dataSupabase2);
      const sumOfSalaries =
        dataSupabase.reduce((sum, current) => sum + current.amount, 0) / 100;
      console.log("Sum of salaries:", sumOfSalaries);
      console.log("Data from Supabase:", dataSupabase);
      console.log("Data from Supabase2:", dataSupabase2);


      let zaplaconyVatSuma = typeof zaplaconyVatProjekcja === 'number' ? zaplaconyVatProjekcja : parseFloat(data3.totalExpensesCat.zaplaconyVat);

      const kosztaBrutto = 
        parseFloat(data2.totalExpensesCat.wyplaty) +
        zaplaconyVatSuma +
        parseFloat(data.totalExpensesCat.czynsze) +
        parseFloat(data2.totalExpensesCat.dochodowy) +
        parseFloat(data2.totalExpensesCat.zus) +
        parseFloat(data.totalExpensesCat.subskrypcje) +
        parseFloat(data.totalExpensesCat.uslugi) +
        parseFloat(data.totalExpensesCat.pozostale);

      // Przygotowanie nowych danych na podstawie kluczy z totalExpensesCat
      const dataWithLabels = [
        {
          label: "Pozostałe wpływy",
          value: data.totalExpensesCat.pozostaleWplywy,
        },
        { label: "Opłacona bramka", value: data.totalExpensesCat.bramka },
        {
          label: "Wystawione FV (nieopłacone)",
          value: dataSupabase2.totalVatValue,
        },
        {
          label: "Przychód brutto (bramka + pozostałe wpływy + wystawione FV)",
          value: przychodBrutto,
        },
        {
          label: "Pełne koszta (konto)",
          value: kosztaBrutto * -1,
        },
        { label: "Pensje m+1", value: data2.totalExpensesCat.wyplaty * -1 },
        {
          label: typeof zaplaconyVatProjekcja === 'number' ? "VAT m+2 (PROJEKCJA 19%)" : "VAT m+2",
          value: typeof zaplaconyVatProjekcja === 'number' ? zaplaconyVatProjekcja * -1 : parseFloat(data3.totalExpensesCat.zaplaconyVat) * -1,
        },
        { label: "Czynsze", value: data.totalExpensesCat.czynsze * -1 },
        {
          label: "Dochodowy m+1",
          value: data2.totalExpensesCat.dochodowy * -1,
        },
        { label: "ZUS + PIT m+1", value: data2.totalExpensesCat.zus * -1 },
        { label: "Subskrypcje", value: data.totalExpensesCat.subskrypcje * -1 },
        { label: "Usługi", value: data.totalExpensesCat.uslugi * -1 },
        { label: "Pozostałe", value: data.totalExpensesCat.pozostale * -1 },
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
        <div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <button onClick={updateChartData}>Zatwierdź</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <button onClick={updateChartData}>Zatwierdź</button>
      </div>
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
