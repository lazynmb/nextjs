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
  const [salariesData, setSalariesData] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [
      "Pozostałe wpływy",
      "Opłacona bramka",
      "Firmy (realne wpłaty na konto)",
      "Wpływy na konto (cashflow)",
      "Wystawione FV (nieopłacone)",
      "Przychód brutto (bramka + pozostałe wpływy + wystawione FV)",
      "Pełne koszta",
      "Pensje",
      "Pensje konto + cash",
      "VAT",
      "Czynsze",
      "Dochodowy",
      "ZUS + PIT",
      "Subskrypcje",
      "Usługi",
      "Pozostałe",
    ],
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

      // trzecie zapytanie do API Supabase


      const responseSupabase = await fetch(
          `/api/supabaseSalariesMonth?year=${selectedYear}&month=${selectedMonth}`);
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

      setApiDataFirst(data);
      setApiDataSecond(data2);
      setSalariesData(dataSupabase);
      const sumOfSalaries = dataSupabase.reduce((sum, current) => sum + current.amount, 0) / 100;
      console.log("Sum of salaries:", sumOfSalaries);
      console.log("Data from Supabase:", dataSupabase);
      console.log("Data from Supabase:", dataSupabase2);

      const przychodBrutto = parseFloat(data.totalExpensesCat.pozostaleWplywy) + parseFloat(data.totalExpensesCat.bramka) + parseFloat(dataSupabase2.totalVatValue);
      console.log("Przychód brutto:", przychodBrutto);


      // Przygotowanie nowych danych na podstawie kluczy z totalExpensesCat
      const newData = [
        data.totalExpensesCat.pozostaleWplywy, // Przykład dla "Wystawione FV"
        data.totalExpensesCat.bramka,
        data.totalExpensesCat.platnosciFirmy,
        data.calcFromPairsResult.totalBrutto,
        dataSupabase2.totalVatValue,
        przychodBrutto,
        data.calcFromNegativePairsResult.totalBruttoNegative * -1,
        data2.totalExpensesCat.wyplaty * -1,
        sumOfSalaries,
        data2.totalExpensesCat.zaplaconyVat * -1,
        data.totalExpensesCat.czynsze * -1,
        data2.totalExpensesCat.dochodowy * -1,
        data2.totalExpensesCat.zus * -1,
        data.totalExpensesCat.subskrypcje * -1,
        data.totalExpensesCat.uslugi * -1,
        data.totalExpensesCat.pozostale * -1, // Przykład dla "Opłacona bramka"
        // Tutaj kontynuuj z pozostałymi kategoriami zgodnie z etykietami na wykresie
      ];

      const backgroundColors = chartData.labels.map((_, index) =>
        index < 6 ? "rgba(54, 162, 235, 0.2)" : "rgba(255, 99, 132, 0.2)"
      );

      // Przygotowanie kolorów obramowania dla każdego ze słupków
      const borderColors = chartData.labels.map((_, index) =>
        index < 6 ? "rgba(54, 162, 235, 1)" : "rgba(255, 99, 132, 1)"
      );

      setChartData((prevState) => ({
        ...prevState,
        datasets: [
          {
            ...prevState.datasets[0],
            data: newData,
            backgroundColor: backgroundColors, // Przypisanie kolorów tła
            borderColor: borderColors, // Przypisanie kolorów obramowania
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
    Pensje: { detailKey: "wyplatyDetail", source: "second" },
    VAT: { detailKey: "zaplaconyVatDetail", source: "second" },
    Czynsze: { detailKey: "czynszeDetail", source: "first" },
    Dochodowy: { detailKey: "dochodowyDetail", source: "second" },
    Subskrypcje: { detailKey: "subskrypcjeDetail", source: "first" },
    Usługi: { detailKey: "uslugiDetail", source: "first" },
    Pozostałe: { detailKey: "pozostaleDetail", source: "first" },
    Firmy: { detailKey: "platnosciFirmyDetail", source: "first" },
    "Pozostałe wpływy": { detailKey: "pozostaleWplywyDetail", source: "first" },
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
          const detailSource = mappingInfo.source === "first" ? apiDataFirst.categoriesResult.allExpDetail : apiDataSecond.categoriesResult.allExpDetail;
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
