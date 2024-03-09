import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import '../styles/custom.css';


interface CategoryValues {
  [categoryName: string]: number[];
}

interface DataType {
  calcFromPairsResult: number; 
  calcFromNegativePairsResult: number; 
  categoriesResult: number; 
  totalIncome: number; 
  totalAllExp: CategoryValues; 
  totalExpensesCat: CategoryValues;
  latestFile: string | null;
}

export default function Page() {
  const [data, setData] = useState({ 
    calcFromPairsResult: null, 
    calcFromNegativePairsResult: null, 
    categoriesResult: null, 
    totalIncome: null, 
    totalAllExp: {} as CategoryValues,
    totalExpensesCat: {} as CategoryValues,
    latestFile: null,
  });

  const [isTableExpanded, setIsTableExpanded] = useState(false);

  const handleFileUpload = async (event:React.ChangeEvent<HTMLInputElement> ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]; // Teraz 'file' jest poprawnie zdefiniowane
  
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          console.log('Plik został przesłany.');
        } else {
          console.error('Błąd podczas przesyłania pliku.');
        }
      } catch (error) {
        console.error('Wyjątek podczas przesyłania pliku:', error);
      }
    } else {
      console.log('Nie wybrano pliku.');
    }
  };

  function formatCurrency(value: any) {
    return value ? `${value} zł` : '';
  }

  useEffect(() => {
    // Najpierw wykonaj przetwarzanie danych
    fetch('/api/processData')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Błąd podczas przetwarzania danych');
        }
        return response.json(); // Tutaj możesz oczekiwać, że processData zwróci potwierdzenie, że procesowanie się zakończyło
      })
      .then(() => {
        // Po przetworzeniu danych, pobierz je z /api/calc
        return fetch('/api/calc');
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Błąd podczas pobierania danych');
        }
        return response.json();
      })
      .then(data => {
        setData(data); // Ustaw stan danymi z /api/calc
        console.log(data); // Loguj dane
      })
      .catch(error => console.error("Failed to fetch data:", error));
  }, []);

  if (!data.calcFromPairsResult) {
    return <p>Loading...</p>;
  }

  return (
    
    <div className="containerMain">
      <div className="container">
        <div className="title">
          <h3>Najnowszy plik: {data.latestFile}</h3>
        </div>
        <div className="przychody">
          <table className="table table-hover table-striped table-bordered table-dark abc">
            <thead className="thead-dark ">
              <tr>
                <th scope="col">ZYSKI</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Brutto:</td>
                <td className="kol">{formatCurrency((data.calcFromPairsResult as any).totalBrutto)}</td>
              </tr>
              <tr>
                <td>Total VAT:</td>
                <td className="kol">{formatCurrency((data.calcFromPairsResult as any).totalVAT)}</td>
              </tr>
              <tr>
                <td>Total Net:</td>
                <td className="kol">{formatCurrency((data.calcFromPairsResult as any).totalNet)}</td>
              </tr>
            </tbody>
        </table>
        </div>
        <div className="koszty">
          <table className="table table-hover table-striped table-bordered table-dark wydatki-table">
            <thead className="thead-dark">
            <tr>
              <th scope="col">KOSZTY</th>
              <th scope="col"></th>
            </tr>
            </thead>
            <tbody>
              <tr>
                <td>Wydatki VAT:</td>
                <td className="kol">{formatCurrency((data.calcFromNegativePairsResult as any).totalVATNegative)}</td>
              </tr>
              <tr>
                <td>VAT do zapłacenia:</td>
                <td className="kol">{formatCurrency((data.calcFromNegativePairsResult as any).totalVATNettoNegative)}</td>
              </tr>
              <tr>
                <td>Zysk netto:</td>
                <td className="kol">{formatCurrency((data.totalIncome as any).totalIncome)}</td>
              </tr>
            </tbody>
        </table>
        </div>
        <div className="kategorie-suma">
        <table className="table table-hover table-striped table-bordered table-dark kategorie-table">
          <thead>
            <tr>
              <th className="lewa-kolumna">KATEGORIE</th>
              <th className="prawa-kolumna">KWOTA</th>
            </tr>
          </thead>
          <tbody>
          {Object.entries(data.totalExpensesCat).map(([categoryName, values]) => (
              <React.Fragment key={categoryName}>
                {(Array.isArray(values) ? values : [values]).map((value, valueIndex) => (
                  <tr key={`${categoryName}-${valueIndex}`}>
                    <td className="category-column">{categoryName}</td>
                    <td className="value-column">{formatCurrency(value)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        </div>
        <div className="kategorie-detail">
          <table id="abc" className="table table-hover table-striped table-bordered table-dark kategorie-table">
            <thead>
              <tr>
                <th className="lewa-kolumna">KATEGORIE</th>
                <th className="prawa-kolumna">KWOTA</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.totalAllExp).map(([categoryName, values]) => (
                <React.Fragment key={categoryName}>
                  <tr>
                    <td colSpan={2} className="category-name">{categoryName}</td>
                  </tr>
                  {(Array.isArray(values) ? values : [values]).map((value, valueIndex) => (
                    <tr key={`${categoryName}-${valueIndex}`}>
                      <td className="category-column">{valueIndex + 1}</td>
                      <td className="value-column">{formatCurrency(value)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
        </table>
        </div>
      </div>
      <div className="container2">
        <div className="loadButton">
          <input type="file" onChange={handleFileUpload} />
        </div>
      </div>
    </div>
    
    );
  }
