import React, { useEffect, useState } from 'react';
import { Chart, Line } from 'react-chartjs-2';
import pobranieDanych from '../utils/DownDetailDataApi5Fetch';
import calculateAverageExpenses from '../utils/calculateAverageExpenses';
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
import { on } from 'events';
  
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


async function processGainsAndLosses(rawData) {
    // Przekształcenie wartości na obiekty zawierające wartość i flagę
    let zaplaconyVatProjekcja = {
        value: parseFloat(rawData.apiDataThird[0]?.totalExpensesCat.zaplaconyVat),
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
        value: parseFloat(rawData.apiDataSecond[0]?.totalExpensesCat.dochodowy),
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
        value: parseFloat(rawData.apiDataSecond[0]?.totalExpensesCat.zus),
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
        value: parseFloat(rawData.apiDataSecond[0]?.totalExpensesCat.wyplaty),
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

    // Budowanie listy przychodów i kosztów z obiektów z wartością i flagą
    return {
        gains: [
            {
                label: "Przychód brutto",
                value: (parseFloat(rawData.apiDataFirst[0].totalExpensesCat.pozostaleWplywy) + parseFloat(rawData.apiDataFirst[0].totalExpensesCat.bramka) + parseFloat(rawData.invoicesData.totalVatValue)).toFixed(2),
                isProjected: false
            },
            {
                label: "Wystawione FV (nieopłacone)",
                value: parseFloat(rawData.invoicesData.totalVatValue).toFixed(2),
                isProjected: false
            },
            {
                label: "Opłacona bramka",
                value: parseFloat(rawData.apiDataFirst[0].totalExpensesCat.bramka).toFixed(2),
                isProjected: false
            },
            {
                label: "Pozostałe wpływy",
                value: parseFloat(rawData.apiDataFirst[0].totalExpensesCat.pozostaleWplywy).toFixed(2),
                isProjected: false
            }
        ],
        losses: [
            {
                label: "Koszta brutto",
                value: (-parseFloat(pensjeProjekcja.value) - parseFloat(zaplaconyVatProjekcja.value) - parseFloat(rawData.apiDataFirst[0].totalExpensesCat.czynsze) - parseFloat(dochodowyProjekcja.value) - parseFloat(zusProjekcja.value) - parseFloat(rawData.apiDataFirst[0].totalExpensesCat.subskrypcje) - parseFloat(rawData.apiDataFirst[0].totalExpensesCat.uslugi) - parseFloat(rawData.apiDataFirst[0].totalExpensesCat.pozostale)).toFixed(2),
                isProjected: pensjeProjekcja.isProjected || zaplaconyVatProjekcja.isProjected || dochodowyProjekcja.isProjected || zusProjekcja.isProjected
            },
            { 
                label: "Pensje m+1", 
                value: (-parseFloat(pensjeProjekcja.value)).toFixed(2),
                isProjected: pensjeProjekcja.isProjected
            },
            {
                label: "VAT m+2",
                value: (-parseFloat(zaplaconyVatProjekcja.value)).toFixed(2),
                isProjected: zaplaconyVatProjekcja.isProjected
            },
            { 
                label: "Czynsze", 
                value: (-parseFloat(rawData.apiDataFirst[0].totalExpensesCat.czynsze)).toFixed(2),
                isProjected: false
            },
            {
                label: "Dochodowy m+1",
                value: (-parseFloat(dochodowyProjekcja.value)).toFixed(2),
                isProjected: dochodowyProjekcja.isProjected
            },
            { 
                label: "ZUS + PIT m+1", 
                value: (-parseFloat(zusProjekcja.value)).toFixed(2),
                isProjected: zusProjekcja.isProjected
            },
            { 
                label: "Subskrypcje", 
                value: (-parseFloat(rawData.apiDataFirst[0].totalExpensesCat.subskrypcje)).toFixed(2),
                isProjected: false
            },
            { 
                label: "Usługi", 
                value: (-parseFloat(rawData.apiDataFirst[0].totalExpensesCat.uslugi)).toFixed(2),
                isProjected: false
            },
            { 
                label: "Pozostałe", 
                value: (-parseFloat(rawData.apiDataFirst[0].totalExpensesCat.pozostale)).toFixed(2),
                isProjected: false
            }
        ]
    };
}


// Komponent wykresu
const ZyskiWykres = ({ data, onMonthChange, selectedDate }) => {
    const [selectedMonthData, setSelectedMonthData] = useState(null);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(null);
    const [gainsData, setGainsData] = useState([]);
    const [lossesData, setLossesData] = useState([]);

    useEffect(() => {
        // Synchronizacja zewnętrznego wyboru daty z wewnętrznym stanem
        if (selectedDate && data.length > 0) {
            const monthData = data.find(d => d.month === selectedDate.month && d.year === selectedDate.year);
            const monthIndex = data.indexOf(monthData);
            setSelectedMonthData(monthData);
            setSelectedMonthIndex(monthIndex);
        }
    }, [selectedDate, data]);

    const createStorageKey = (data) => `${data.year}-${data.month}`;

    const formatCurrency = (value) => {
        const numberValue = parseFloat(value);
        const fixedValue = numberValue.toFixed(2);
        return `${fixedValue.toLocaleString('pl-PL')} zł`;
    };

    const getBackgroundColor = (item) => {
        return item.isProjected ? 'red-background' : 'transparent';
    };

    const saveDataToCache = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    const fetchDataAndProcess = async () => {
        if (selectedMonthData) {
            const storageKey = createStorageKey(selectedMonthData);
            const cachedData = localStorage.getItem(storageKey);
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                setGainsData(parsedData.gains);
                setLossesData(parsedData.losses);
            } else {
                try {
                    const globalData = await pobranieDanych(selectedMonthData.year, selectedMonthData.month);
                    const processedData = await processGainsAndLosses(globalData);
                    saveDataToCache(storageKey, processedData);
                    setGainsData(processedData.gains);
                    setLossesData(processedData.losses);
                } catch (error) {
                    console.error("Error processing data: ", error);
                }
            }
        }
    };

    useEffect(() => {
        fetchDataAndProcess();
    }, [selectedMonthData]);

    const handlePointClick = (elements, event) => {
        if (elements.length > 0) {
            const index = elements[0].index;
            setSelectedMonthIndex(index);
            const monthData = {
                month: data[index].month,
                year: data[index].year,
                amount: data[index].amount
            };
            setSelectedMonthData(monthData);
            if (onMonthChange) { // Dodanie sprawdzenia, czy funkcja istnieje
                onMonthChange(monthData);
            }
        } else {
            console.log("No elements clicked.");
            setSelectedMonthIndex(null);
            setSelectedMonthData(null);
            if (onMonthChange) { // Dodanie sprawdzenia, czy funkcja istnieje
                onMonthChange(null);
            }
        }
    };
    
    const selectPrevious = () => {
        if (selectedMonthIndex > 0) {
            const newIndex = selectedMonthIndex - 1;
            setSelectedMonthIndex(newIndex);
            const monthData = {
                month: data[newIndex].month,
                year: data[newIndex].year,
                amount: data[newIndex].amount
            };
            setSelectedMonthData(monthData);
            if (onMonthChange) { // Dodanie sprawdzenia, czy funkcja istnieje
                onMonthChange(monthData);
            }
        }
    };
    
    const selectNext = () => {
        if (selectedMonthIndex < data.length - 1) {
            const newIndex = selectedMonthIndex + 1;
            setSelectedMonthIndex(newIndex);
            const monthData = {
                month: data[newIndex].month,
                year: data[newIndex].year,
                amount: data[newIndex].amount
            };
            setSelectedMonthData(monthData);
            if (onMonthChange) { // Dodanie sprawdzenia, czy funkcja istnieje
                onMonthChange(monthData);
            }
        }
    };



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
                pointBorderColor: data.map((z, index) => index === selectedMonthIndex ? 'rgba(255, 0, 0, 0.5)' : 'rgb(54, 162, 235)'),
                pointBorderWidth: data.map((z, index) => index === selectedMonthIndex ? 2.5 : 0),
                pointRadius: data.map((z, index) => index === selectedMonthIndex ? 7 : 3),
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
        onClick: (event, elements) => {
            handlePointClick(elements, event);
        },
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

    return (
        <div  style={{ display: 'flex', width: '100%' }}>
            <div className="wykreswykres" style={{ flex: 3 }}>
                <Line data={chartData} options={options} />
            </div>
            <div className="tabelka" style={{ flex: 1 }}>
                {selectedMonthData ? (
                    <table className="table table-hover table-striped table-bordered table-dark abc">
                        <thead className="thead-dark">
                            <tr>
                                <td colSpan="3">
                                    {/* Navigation buttons */}
                                    <button onClick={() => selectPrevious()} style={{ marginRight: "10px" }}>&lt;</button>
                                    <button onClick={() => selectNext()}>&gt;</button>
                                </td>
                            </tr>
                            <tr>
                                <th>Miesiąc</th>
                                <th>Rok</th>
                                <th>Zysk</th>
                            </tr>
                                <tr>
                                <td>{selectedMonthData.month}</td>
                                <td>{selectedMonthData.year}</td>
                                <td>{selectedMonthData.amount}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan="3">
                                    <div style={{ display: "flex", width: "100%" }}>
                                        {/* Gains Table */}
                                        <div style={{ flex: 1, padding: "0 10px" }}>
                                            <table className="table table-hover table-striped table-bordered table-dark">
                                                <thead>
                                                    <tr>
                                                        <th colSpan="2">Zyski</th>
                                                    </tr>
                                                    <tr>
                                                        <td>Kategoria</td>
                                                        <td>Wartość</td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {gainsData.map((gain, index) => (
                                                        <tr key={index}>
                                                            <td>{gain.label}</td>
                                                            <td className={getBackgroundColor(gain)} style={{ textAlign: 'right' }}>
                                                            {formatCurrency(parseFloat(gain.value))}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Losses Table */}
                                        <div style={{ flex: 1, padding: "0 10px" }}>
                                            <table className="table table-hover table-striped table-bordered table-dark">
                                                <thead>
                                                    <tr>
                                                        <th colSpan="2">Straty</th>
                                                    </tr>
                                                    <tr>
                                                        <td>Kategoria</td>
                                                        <td>Wartość</td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                {lossesData.map((loss, index) => (
                                                    <tr key={index}>
                                                        <td>{loss.label}</td>
                                                        <td className={getBackgroundColor(loss)} style={{ textAlign: 'right' }}>
                                                        {formatCurrency(parseFloat(loss.value))}
                                                        </td>
                                                    </tr>
                                                ))}

                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <p>Kliknij punkt na wykresie, aby zobaczyć szczegóły.</p>
                )}
            </div>
        </div>
    );
};



// Główny komponent aplikacji lub strony, który używa powyższych funkcji
const App = ({ changeMonthData }) => {
    const [data, setData] = useState(null); // Data jest null na początku
    const [isLoading, setIsLoading] = useState(true); // Zarządzanie stanem ładowania

    const handleMonthChange = (monthData) => {
        changeMonthData(monthData);
      };

    useEffect(() => {
        fetchZyskiData().then(fetchedData => {
            setData(fetchedData); // Ustaw dane
            setIsLoading(false); // Zakończ ładowanie
        }).catch(error => {
            console.error('Error fetching data:', error);
            setIsLoading(false); // Zakończ ładowanie nawet w przypadku błędu
        });
    }, []);

    if (isLoading) {
        return <p>Ładowanie danych...</p>; // Informacja o ładowaniu
    }

    if (!data || data.length === 0) {
        return <p>Brak danych</p>; // Brak danych
    }

    return <ZyskiWykres data={data} onMonthChange={handleMonthChange}/>; // Renderowanie komponentu z danymi
};

export default App;