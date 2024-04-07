import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProfitChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Zysk (przychódBrutto - kosztaBrutto)',
      data: [],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  });

  useEffect(() => {
    const fetchData = async () => {
      let profits = [];
      let labels = [];
      for (let i = 11; i >= 0; i--) {
        const date = moment().subtract(i, 'months');
        const year = date.format('YYYY');
        const month = date.format('MM');
        
        // Tutaj powinno nastąpić pobranie danych dla danego roku i miesiąca
        // Na potrzeby przykładu zakładam, że istnieje funkcja getMonthlyProfit(year, month)
        // która zwraca obiekt z wartościami przychodu brutto i kosztów brutto
        const { przychodBrutto, kosztaBrutto } = await getMonthlyProfit(year, month);

        const profit = przychodBrutto - kosztaBrutto;
        profits.push(profit);
        labels.push(`${month}/${year}`);
      }

      setChartData(prevData => ({
        ...prevData,
        labels,
        datasets: [{
          ...prevData.datasets[0],
          data: profits,
        }],
      }));
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Zysk na przestrzeni ostatnich 12 miesięcy</h2>
      <Bar data={chartData} />
    </div>
  );
};

async function getMonthlyProfit(year, month) {
  // Tutaj powinno nastąpić pobranie danych z API i przeliczenie przychodu oraz kosztów
  // Dla uproszczenia zakładamy, że ta funkcja zwraca przykładowe wartości
  // W rzeczywistym kodzie należałoby zaimplementować logikę pobierania danych
  return {
    przychodBrutto: Math.random() * 10000,
    kosztaBrutto: Math.random() * 5000,
  };
}

export default ProfitChart;
