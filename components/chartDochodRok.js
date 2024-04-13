import React, { useEffect, useState } from 'react';
import { Chart, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
  } from 'chart.js';
  import annotationPlugin from 'chartjs-plugin-annotation';
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    annotationPlugin
    // Annotation jest rejestrowana przez sam plugin, więc nie musisz jej dodawać tutaj
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
                borderColor: 'rgb(75, 192, 192)', // Default color
                segment: {
                    borderColor: ctx => {
                        // Sprawdzenie obecnego punktu (p0) i następnego punktu (p1)
                        const p0IsMissing = ctx.p0DataIndex !== null && !data[ctx.p0DataIndex].isDataComplete;
                        const p1IsMissing = ctx.p1DataIndex !== null && !data[ctx.p1DataIndex].isDataComplete;
                        return p0IsMissing || p1IsMissing ? 'orange' : 'rgb(75, 192, 192)';
                    },
                    borderDash: ctx => {
                        const p0IsMissing = ctx.p0DataIndex !== null && !data[ctx.p0DataIndex].isDataComplete;
                        const p1IsMissing = ctx.p1DataIndex !== null && !data[ctx.p1DataIndex].isDataComplete;
                        return p0IsMissing || p1IsMissing ? [5, 5] : [];
                    }
                },
                pointBackgroundColor: data.map(z => z.isDataComplete ? 'rgb(54, 162, 235)' : 'orange'),
                pointBorderColor: data.map(z => z.isDataComplete ? 'rgb(54, 162, 235)' : 'orange')
            },
            {
                label: 'Projekcja zysku',
                borderColor: 'orange',
                pointBackgroundColor: 'orange',
                pointBorderColor: 'orange'
            }
        ],
    };

    const options = {
        plugins: {
            annotation: {
                annotations: {
                    lineAtZero: {
                        type: 'line',
                        yMin: 0,
                        yMax: 0,
                        borderColor: 'red',
                        borderWidth: 1,
                        borderDash: [6, 6]
                    }
                }
            }
        },
        maintainAspectRatio: true,
    };

    return <Line data={chartData} options={options} />;
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