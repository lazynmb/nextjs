import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import '../styles/custom.css';




interface DataType {
  calcFromPairsResult: number; // Replace 'any' with the actual type of calcFromPairsResult
  calcFromNegativePairsResult: number; // Replace 'any' with the actual type of calcFromNegativePairsResult
  categoriesResult: number; // Replace 'any' with the actual type of categoriesResult
  totalIncome: number; // Replace 'any' with the actual type of totalIncome
}




export default function Page() {
  const [data, setData] = useState({ calcFromPairsResult: null, calcFromNegativePairsResult: null, categoriesResult: null, totalIncome: null });

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
      <div className="tabela w-50 mx-auto">
      <h3 className="white">Data from calc.js:</h3>
      <table className="table table-bordered table-dark">
      <thead className="thead-dark">
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
      <div className="tabela w-50 mx-auto">
        <table className="table table-bordered table-dark">
        <thead className="thead-dark">
        <tr>
          <th scope="col" className="text-center">KATEGORIE</th>
          <th scope="col" className="text-center">KWOTA</th>
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
    </div>
  );
}