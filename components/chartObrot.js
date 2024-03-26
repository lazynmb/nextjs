import React, { useState, useEffect } from 'react';
import Modal from '../components/modal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [apiData, setApiData] = useState({});
  const [chartData, setChartData] = useState({
    labels: [
      "Wystawione FV", "Opłacona bramka", "Inne wpływy", "Wpływy na konto",
      "Pełne koszta", "Pensje", "VAT", "Czynsze", "Dochodowy", "Subskrypcje", "Usługi", "Pozostałe"
    ],
    datasets: [{
      label: 'Kwota',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    }],
  });
  const [detailsToShow, setDetailsToShow] = useState({});
  const [hasError, setHasError] = useState(false);

  const years = ["2022", "2023", "2024"];
  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  const updateChartData = async () => {
    try {
      const response = await fetch(`/api/databaseFetchData?year=${selectedYear}&month=${selectedMonth}`);
      if (!response.ok) {
        throw new Error('Problem with fetching data');
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

        console.log("Fetched data from API:", fetchedData);
        console.log("Fetched data from second API call:", fetchedDataAPI2);
        // Zakładamy, że API zwraca tablicę obiektów i interesuje nas pierwszy element
        const data = fetchedData[0];
        console.log("Data from first API call:", data);
        const data2 = fetchedDataAPI2[0];

        setApiData({
          allExpDetail: data.categoriesResult.allExpDetail,
          // Możesz dodać więcej danych, jeśli jest taka potrzeba
        });


        // Przygotowanie nowych danych na podstawie kluczy z totalExpensesCat
        const newData = [
          data.calcFromPairsResult.totalBrutto, // Przykład dla "Wystawione FV"
          data.totalExpensesCat.bramka,
          data.totalExpensesCat.bramka,
          data.calcFromPairsResult.totalBrutto,
          data.calcFromNegativePairsResult.totalBruttoNegative * -1,
          data.totalExpensesCat.wyplaty * -1,
          data.totalExpensesCat.zaplaconyVat * -1,
          data.totalExpensesCat.czynsze * -1,
          data.totalExpensesCat.dochodowy * -1,
          data.totalExpensesCat.subskrypcje * -1,
          data.totalExpensesCat.uslugi * -1,
          data.totalExpensesCat.pozostale * -1, // Przykład dla "Opłacona bramka"
          // Tutaj kontynuuj z pozostałymi kategoriami zgodnie z etykietami na wykresie
        ];

      const backgroundColors = chartData.labels.map((_, index) =>
        index < 4 ? "rgba(54, 162, 235, 0.2)" : "rgba(255, 99, 132, 0.2)"
      );

      // Przygotowanie kolorów obramowania dla każdego ze słupków
      const borderColors = chartData.labels.map((_, index) =>
        index < 4 ? "rgba(54, 162, 235, 1)" : "rgba(255, 99, 132, 1)"
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




  const options = {
    onClick: (event, elements) => {
      console.log("asdsdasdasdasdasdasd" + detailsToShow);
      if (elements.length > 0) {
        const { index } = elements[0];
        const label = chartData.labels[index];
        const detailMapping = {
          "Opłacona bramka": "bramkaDetail",
          "Pensje": "wyplatyDetail",
          "VAT": "zaplaconyVatDetail",
          "Czynsze": "czynszeDetail",
          "Dochodowy": "dochodowyDetail",
          "Subskrypcje": "subskrypcjeDetail",
          "Usługi": "uslugiDetail",
          "Pozostałe": "pozostaleDetail",
        };
        setDetailsToShow(apiData.allExpDetail[detailMapping[label]]);
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const renderDetails = (details) => {
    if (Array.isArray(details)) {
      // Jeśli details to tablica, renderuj jej elementy
      return (
        <ul>
          {details.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    } else if (typeof details === 'object') {
      // Jeśli details to obiekt, iteruj po jego kluczach
      return (
        <div>
          {Object.keys(details).map(key => (
            <div key={key}>
              <h3>{key}</h3>
              {renderDetails(details[key])} {/* Rekurencyjne wywołanie dla wartości obiektu */}
            </div>
          ))}
        </div>
      );
    } else {
      // Dla prostych wartości
      return <span>{details}</span>;
    }
  };

  if (hasError) {
    return (<><div>Błąd podczas ładowania danych.</div>
    <div>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          {years.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {months.map(month => <option key={month} value={month}>{month}</option>)}
        </select>
        <button onClick={updateChartData}>Zatwierdź</button>
      </div></>);
  }

  return (
    <>
      <div>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          {years.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {months.map(month => <option key={month} value={month}>{month}</option>)}
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
