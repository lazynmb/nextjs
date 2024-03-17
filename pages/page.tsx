import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { ChangeEvent } from 'react';
import '../styles/custom.css';
import BarChart from '../components/chart';


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

interface FileDetails {
  calcFromPairsResult: {
    totalNet: number;
    totalVAT: number;
    totalBrutto: number;
  };
  calcFromNegativePairsResult: {
    totalBruttoNegative: number;
    totalNewNettoNegative: number;
    totalVATNegative: number;
    totalVATNettoNegative: number;
    
  };
  totalIncome: {
    totalIncome: number;
  };

  totalExpensesCat: {
    [category: string]: number; // Zakładając, że każda kategoria to string z wartością
  };
  // Zdefiniuj resztę potrzebnych pól...
}


function DataViewer() {
  const [fileNames, setFileNames] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);

  // Pobierz nazwy plików przy inicjalizacji komponentu
  useEffect(() => {
    async function fetchFileNames() {
      const response = await fetch('/api/getMonths');
      if (!response.ok) {
        console.error('Failed to fetch file names');
        return;
      }
      const results = await response.json();
      setFileNames(results.map((result: Record<string, unknown>) => result.fileName));
    }
    fetchFileNames();
  }, []);

  // Handler dla zmiany wybranego pliku
  const handleFileChange = async (selectedFileName: string) => {
    setSelectedFileName(selectedFileName);
    const response = await fetch(`/api/getDataForMonths?fileName=${encodeURIComponent(selectedFileName)}`);
    if (!response.ok) {
      console.error('Failed to fetch file details');
      return;
    }
    const detailsArray = await response.json();
    if (detailsArray && detailsArray.length > 0) {
      const details = detailsArray[0]; // Pobieramy pierwszy element z tablicy
      setFileDetails(details);
      console.log(details); // Logowanie szczegółów w konsoli
    } else {
      console.error("No details found for the file");
      setFileDetails(null);
    }
  };

  const formatCurrency = (value: number) => {
    return value ? `${value} zł` : '';
  };

  return (
    <div>
      <div className='wybormy'>
      <select onChange={(e) => handleFileChange(e.target.value)} value={selectedFileName}>
        <option value="">Wybierz plik</option>
        {fileNames.map((fileName, index) => (
          <option key={index} value={fileName}>
            {fileName}
          </option>
        ))}
      </select>
      </div>
      <div></div>
      {fileDetails && (
        <React.Fragment>
        <div className='container-miesiace'>
          <div className="przychody">
            <table className="table table-hover table-striped table-bordered table-dark abc">
              <thead className="thead-dark ">
                <tr>
                  <th scope="col">ZYSKI</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {/* Przykład danych, które mogą być wyświetlane */}
                <tr>
                  <td>Total Brutto:</td>
                  <td className="kol">{formatCurrency(fileDetails.calcFromPairsResult?.totalBrutto)}</td>
                </tr>
                <tr>
                  <td>Total VAT:</td>
                  <td className="kol">{formatCurrency(fileDetails.calcFromPairsResult?.totalVAT)}</td>
                </tr>
                <tr>
                  <td>Total Net:</td>
                  <td className="kol">{formatCurrency(fileDetails.calcFromPairsResult?.totalNet)}</td>
                </tr>
                {/* Możesz dodać więcej wierszy tabeli na podstawie struktury twoich danych */}
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
                        <td className="kol">{formatCurrency(fileDetails.calcFromNegativePairsResult?.totalVATNegative)}</td>
                      </tr>
                      <tr>
                        <td>VAT do zapłacenia:</td>
                        <td className="kol">{formatCurrency(fileDetails.calcFromNegativePairsResult?.totalVATNettoNegative)}</td>
                      </tr>
                      <tr>
                        <td>Zysk netto:</td>
                        <td className="kol">{formatCurrency(fileDetails.totalIncome?.totalIncome)}</td>
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
            {Object.entries(fileDetails.totalExpensesCat).map(([categoryName, values]) => (
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
        </div>
        </React.Fragment>
      )}
    </div>
  );
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

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
  if (event.target.files && event.target.files.length > 0) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Najpierw przesyłanie pliku do serwera
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
 
      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        console.log('File uploaded successfully:', uploadResult);
        const processDataResponse = await fetch('/api/processData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Przekazywanie nazwy pliku zgodnie z oczekiwaniami API
          body: JSON.stringify({ downloadUrl: uploadResult.downloadUrl }),
        });

        if (!processDataResponse.ok) {
          throw new Error('Failed to process file');
        }

        // Dodatkowa logika po pomyślnym przetworzeniu pliku...
        console.log('File processed successfully');
      } else {
        console.error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error during file upload and processing:', error);
    }
  } else {
    console.log('No file selected');
  }
};

  

  function formatCurrency(value: any) {
    return value ? `${value} zł` : '';
  }

  useEffect(() => {
    // Najpierw wykonaj przetwarzanie danych
    fetch('/api/calc')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Błąd podczas przetwarzania danych');
        }
        return response.json(); // Tutaj możesz oczekiwać, że processData zwróci potwierdzenie, że procesowanie się zakończyło
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
      <div className="container1">
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
      <DataViewer />
        <div className="loadButton">
          <input type="file" onChange={handleFileUpload} />
        </div>
      </div>
      <div className="container3">
        <div className='title'>
          <h3>Podsumowanie miesiaca (wypłaty i podatki -1)</h3>
        </div>
        <BarChart />
      </div>
    </div>
    
    );
  }

  
