import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Funkcja do pobierania danych z API
const fetchZyskiData = () => {
  return fetch('/api/zyski')
      .then(response => response.json())
      .catch(error => console.error('Błąd podczas pobierania danych zysków:', error));
};

// Komponent wykresu
const ZyskiWykres = ({ data }) => {
    if (!data || data.length === 0) {
        return <p>Brak danych</p>;
    }

    const chartData = {
        labels: data.map(z => `${z.month}/${z.year}`),
        datasets: [
            {
                label: 'Zysk',
                data: data.map(z => z.amount),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            }
        ],
    };

    return <Line data={chartData} />;
};

// Główny komponent aplikacji lub strony, który używa powyższych funkcji
const App = () => {
    const [zyskiData, setZyskiData] = useState([]);

    useEffect(() => {
        fetchZyskiData().then(data => {
            setZyskiData(data);
        });
    }, []);

    return <ZyskiWykres data={zyskiData} />;
};

export default App;