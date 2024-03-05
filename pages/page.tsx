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
}




export default function Page() {
  const [data, setData] = useState({ 
    calcFromPairsResult: null, 
    calcFromNegativePairsResult: null, 
    categoriesResult: null, 
    totalIncome: null, 
    totalAllExp: {} as CategoryValues,
    totalExpensesCat: {} as CategoryValues});

  function formatCurrency(value: any) {
    return value ? `${value} zł` : '';
  }

  useEffect(() => {
    fetch('/api/calc')
      .then(response => response.json())
      .then(data => {
        setData(data); // Ustaw stan
        console.log(data); // Loguj dane
      })
      .catch(error => console.error("Failed to fetch data:", error));
  }, []);

  if (!data.calcFromPairsResult) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container">
      <div className="przychody">
        <table className="table table-hover table-striped table-bordered table-dark abc">
          <thead className="thead-dark ">
            <tr>
              <th scope="col" className="text-center">KATEGORIE</th>
              <th scope="col" className="text-center">KWOTA</th>
            </tr>
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
            <th>KATEGORIE</th>
            <th>KWOTA</th>
          </tr>
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
        <table className="table table-hover table-striped table-bordered table-dark kategorie-table">
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
  );
}