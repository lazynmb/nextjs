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
  console.log("Month data in BarChart:", monthData);

  const updateChartState = (data) => {
    setApiDataFirst((current) => ({ ...current, ...data.apiDataFirst }));
    setApiDataSecond((current) => ({ ...current, ...data.apiDataSecond }));
    setApiDataThird((current) => ({ ...current, ...data.apiDataThird }));
    setSalariesData((current) => ({ ...current, ...data.salariesData }));
    setSupabase2Data((current) => ({ ...current, ...data.supabase2Data }));
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

  const updateChartData = async (year, month) => {
    year = parseInt(year);
    month = parseInt(month);
    const storageKey = `chartData-${year}-${month}`;
    setHasError(false); // Reset stanu błędu przed pobraniem danych

    // Resetowanie stanów przed każdym ładowaniem danych
    setApiDataFirst({});
    setApiDataSecond({});
    setApiDataThird({});
    setSalariesData([]);
    setSupabase2Data([]);
    setChartData({
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

    try {
      const cachedData = localStorage.getItem(storageKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        console.log("Using cached data for:", storageKey);
        updateChartState(parsedData);
        resetStates();
        return;
      }

      // Przygotowanie zapytań do API
      const fetchDataForMonth = async (month, year) =>
        fetch(
          `/api/databaseFetchData?year=${year}&month=${month
            .toString()
            .padStart(2, "0")}`
        );
      const fetchSalariesForMonth = async (month, year) =>
        fetch(
          `/api/supabaseSalariesMonth?year=${year}&month=${month
            .toString()
            .padStart(2, "0")}`
        );
      const fetchInvoicesForMonth = async (month, year) =>
        fetch(
          `/api/supabaseInvoicesMonth?year=${year}&month=${month
            .toString()
            .padStart(2, "0")}`
        );

      const responses = await Promise.all([
        fetchDataForMonth(month, year),
        // Obliczenie dla następnego miesiąca
        month === 12
          ? fetchDataForMonth(1, year + 1)
          : fetchDataForMonth(month + 1, year),
        // Obliczenie dla miesiąca następnego po następnym
        month >= 11
          ? fetchDataForMonth((month + 2) % 12 || 12, year + 1)
          : fetchDataForMonth(month + 2, year),
        fetchSalariesForMonth(month, year),
        // Obliczenie dla następnego miesiąca dla faktur
        month === 12
          ? fetchInvoicesForMonth(1, year + 1)
          : fetchInvoicesForMonth(month + 1, year),
      ]);

      const [apiData1, apiData2, apiData3, salaryData, supabaseData2] =
        await Promise.all(responses.map((res) => res.json()));

      const combinedData = {
        apiDataFirst: apiData1[0],
        apiDataSecond: apiData2[0],
        apiDataThird: apiData3[0],
        salariesData: salaryData,
        supabase2Data: supabaseData2,
      };

      console.log("Combined data for:", storageKey, combinedData);

      updateChartState(combinedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasError(true);
    }
  };

  useEffect(() => {
    // Funkcja ładowania danych
    if (monthData.year && monthData.month) {
      updateChartData(monthData.year, monthData.month);
    }
  }, [monthData]);

  useEffect(() => {
    prepareChartData(); // Przygotowanie danych wykresu za każdym razem, gdy dane ulegną zmianie
  }, [apiDataFirst, apiDataSecond, apiDataThird, salariesData, supabase2Data]);

  const prepareChartData = async () => {
    if (
      !apiDataFirst?.totalExpensesCat ||
      !supabase2Data
    ) {
      console.warn("Dane niekompletne, czekam na wszystkie dane...");
      return;
    }

    let zaplaconyVatProjekcja = {
      value: parseFloat(apiDataThird.totalExpensesCat?.zaplaconyVat),
      isProjected: false
  };

  if (isNaN(zaplaconyVatProjekcja.value)) {
      const response = await fetch(`/api/calculateAverageExpenses?category=${encodeURIComponent('zaplaconyVat')}`);
      const data = await response.json();
      zaplaconyVatProjekcja = {
          value: parseFloat(data.average).toFixed(2),
          isProjected: true
      };
      console.log("Zaplacony VAT projekcja:", zaplaconyVatProjekcja);
  }

  let dochodowyProjekcja = {
      value: parseFloat(apiDataSecond.totalExpensesCat?.dochodowy),
      isProjected: false
  };
  if (isNaN(dochodowyProjekcja.value)) {
      const response = await fetch(`/api/calculateAverageExpenses?category=dochodowy`);
      const data = await response.json();
      dochodowyProjekcja = {
          value: parseFloat(data.average).toFixed(2),
          isProjected: true
      };
  }

  let zusProjekcja = {
      value: parseFloat(apiDataSecond.totalExpensesCat?.zus),
      isProjected: false
  };
  if (isNaN(zusProjekcja.value)) {
      const response = await fetch(`/api/calculateAverageExpenses?category=zus`);
      const data = await response.json();
      zusProjekcja = {
          value: parseFloat(data.average).toFixed(2),
          isProjected: true
      };
  }

  let pensjeProjekcja = {
      value: parseFloat(apiDataSecond.totalExpensesCat?.wyplaty),
      isProjected: false
  };
  if (isNaN(pensjeProjekcja.value)) {
      const response = await fetch(`/api/calculateAverageExpenses?category=wyplaty`);
      const data = await response.json();
      pensjeProjekcja = {
          value: parseFloat(data.average).toFixed(2),
          isProjected: true
      };
    }
    const przychodBrutto = (
      parseFloat(apiDataFirst.totalExpensesCat.pozostaleWplywy) +
      parseFloat(apiDataFirst.totalExpensesCat.bramka) +
      parseFloat(supabase2Data.totalVatValue)
    ).toFixed(2);

    const kosztaBrutto = (
      -parseFloat(pensjeProjekcja.value) -
      parseFloat(zaplaconyVatProjekcja.value) -
      parseFloat(apiDataFirst.totalExpensesCat.czynsze) -
      parseFloat(dochodowyProjekcja.value) -
      parseFloat(zusProjekcja.value) -
      parseFloat(apiDataFirst.totalExpensesCat.subskrypcje) -
      parseFloat(apiDataFirst.totalExpensesCat.uslugi) -
      parseFloat(apiDataFirst.totalExpensesCat.pozostale)
    ).toFixed(2);

    // Budowanie listy przychodów i kosztów z obiektów z wartością i flagą
    const dataWithLabels = [
      {
        label: "Pozostałe wpływy",
        value: apiDataFirst.totalExpensesCat.pozostaleWplywy,
        isProjected: false,
      },
      {
        label: "Opłacona bramka",
        value: apiDataFirst.totalExpensesCat.bramka,
        isProjected: false,
      },
      {
        label: "Wystawione FV (nieopłacone)",
        value: supabase2Data.totalVatValue,
        isProjected: false,
      },
      { label: "Przychód brutto", value: przychodBrutto, isProjected: false },
      { label: "Koszta brutto", value: kosztaBrutto, isProjected: true },
      {
        label: "Pensje m+1",
        value: -(pensjeProjekcja.value),
        isProjected: pensjeProjekcja.isProjected,
      },
      {
        label: "VAT m+2",
        value: -(zaplaconyVatProjekcja.value),
        isProjected: zaplaconyVatProjekcja.isProjected,
      },
      {
        label: "Czynsze",
        value: -parseFloat(apiDataFirst.totalExpensesCat.czynsze).toFixed(2),
        isProjected: false,
      },
      {
        label: "Dochodowy m+1",
        value: dochodowyProjekcja.value,
        isProjected: dochodowyProjekcja.isProjected,
      },
      {
        label: "ZUS + PIT m+1",
        value: -(zusProjekcja.value),
        isProjected: zusProjekcja.isProjected,
      },
      {
        label: "Subskrypcje",
        value: -parseFloat(apiDataFirst.totalExpensesCat.subskrypcje).toFixed(
          2
        ),
        isProjected: false,
      },
      {
        label: "Usługi",
        value: -parseFloat(apiDataFirst.totalExpensesCat.uslugi).toFixed(2),
        isProjected: false,
      },
      {
        label: "Pozostałe",
        value: -parseFloat(apiDataFirst.totalExpensesCat.pozostale).toFixed(2),
        isProjected: false,
      },
    ];

    const labels = dataWithLabels.map((item) => item.label);
    const newData = dataWithLabels.map((item) => item.value);

    const backgroundColors = labels.map((_, index) => {
      // Sprawdzamy, czy jesteśmy przy szóstym słupku (index === 5) i czy zaplaconyVatProjekcja jest liczbą
      if (index === 6 && typeof zaplaconyVatProjekcja === "number")
        return "rgba(255, 0, 0, 0.2)"; // Bardziej czerwony
      else if (index <= 3) return "rgba(54, 162, 235, 0.2)"; // Niebieski
      else return "rgba(255, 99, 132, 0.2)"; // Czerwony
    });

    const borderColors = labels.map((_, index) => {
      // Sprawdzamy, czy jesteśmy przy szóstym słupku (index === 5) i czy zaplaconyVatProjekcja jest liczbą
      if (index === 6 && typeof zaplaconyVatProjekcja === "number")
        return "rgba(255, 0, 0, 1)"; // Bardziej czerwony
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
    "Wystawione FV (nieopłacone)": {
      detailKey: "transformedInvoicesData",
      source: "third",
    },
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
