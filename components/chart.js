import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend);

const BarChart = () => {
  // Dodatkowe stany dla wybranego roku i miesiąca
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  
  // Lista lat i miesięcy dla przykładu
  const years = ['2022', '2023', '2024'];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const [chartData, setChartData] = useState({
    labels: ['Wystawione FV', 'Opłacona bramka', 'Inne wpływy', 'Pełny przychód', 'Pełne koszta', 'Pensje', 'VAT', 'Czynsze', 'Dochodowy', 'Subskrypcje', 'Usługi'],
    datasets: [{
      label: 'Kwota',
      data: [], // Tutaj będziemy wstawiać nasze wartości
      backgroundColor: [
        'rgba(54, 162, 235, 0.2)', // Niebieski dla pierwszych czterech, czerwony dla reszty
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)', // Niebieski dla pierwszych czterech, czerwony dla reszty
      ],
      borderWidth: 1,
    }],
  });

  useEffect(() => {
    const fetchData = async () => {
      // Tu powinieneś pobrać dane w oparciu o wybrany rok i miesiąc
      // Na potrzeby przykładu używam stałych danych
      const data = [12000, 19000, 3000, 5000, 2000, 3000, 4000, 500, 300, 700, 600];
      setChartData((prevState) => ({
        ...prevState,
        datasets: [{
          ...prevState.datasets[0],
          data,
        }],
      }));
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  return (
    <>
      <div>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {months.map((month) => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>
      <Bar data={chartData} options={{ scales: { y: { beginAtZero: true } } }} />
    </>
  );
};

export default BarChart;
