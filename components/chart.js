import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend);


const BarChart = () => {
  const [chartData, setChartData] = useState({
    labels: ['Wystawione FV', 'Opłacona bramka', 'Inne wpływy', 'Pełny przychód', 'Pełne koszta', 'Pensje', 'VAT', 'Czynsze', 'Dochodowy', 'Subskrypcje', 'Usługi'],
    datasets: [
      {
        label: 'Kwota',
        data: [], // Tutaj będziemy wstawiać nasze wartości
        backgroundColor: [
          'rgba(54, 162, 235, 0.2)', // Niebieski
          'rgba(54, 162, 235, 0.2)', // Niebieski
          'rgba(54, 162, 235, 0.2)', // Niebieski
          'rgba(54, 162, 235, 0.2)', // Niebieski
          'rgba(255, 99, 132, 0.2)', // Czerwony
          'rgba(255, 99, 132, 0.2)', // Czerwony
          'rgba(255, 99, 132, 0.2)', // Czerwony
          'rgba(255, 99, 132, 0.2)', // Czerwony
          'rgba(255, 99, 132, 0.2)', // Czerwony
          'rgba(255, 99, 132, 0.2)', // Czerwony
          'rgba(255, 99, 132, 0.2)', // Czerwony
        ],
        borderColor: [
          'rgba(54, 162, 235, 0.2)', // Niebieski
          'rgba(54, 162, 235, 0.2)', // Niebieski
          'rgba(54, 162, 235, 0.2)', // Niebieski
          'rgba(54, 162, 235, 0.2)', // Niebieski
          'rgba(255, 99, 132, 0.2)', // Czerwony
          'rgba(255, 99, 132, 0.2)', // Czerwony
          'rgba(255, 99, 132, 0.2)', // Czerwony
          'rgba(255, 99, 132, 0.2)', // Czerwony
          'rgba(255, 99, 132, 0.2)', // Czerwony
          'rgba(255, 99, 132, 0.2)', // Czerwony
          'rgba(255, 99, 132, 0.2)', // Czerwony
        ],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    // Symulacja pobierania danych
    const fetchData = async () => {
      // Pobierz dane z bazy danych / zewnętrznego API
      const data = [12000, 19000, 3000, 5000, 2000, 3000, 4000, 500, 300, 700, 600]; // Przykładowe dane

      setChartData((prevState) => ({
        ...prevState,
        datasets: [
          {
            ...prevState.datasets[0],
            data, // Aktualizacja danych
          },
        ],
      }));
    };

    fetchData();
  }, []);

  return <Bar data={chartData} options={{ scales: { y: { beginAtZero: true } } }} />;
};

export default BarChart;
