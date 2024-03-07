// pages/api/calc.js
import fs from 'fs';
import path, { parse } from 'path';
import cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import nextConnect from 'next-connect';
import { IncomingForm } from 'formidable';

// Supabase client initialization
const supabase = createClient('https://vzirtldrmuzpurjjcsrf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6aXJ0bGRybXV6cHVyampjc3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NTcyODUwNywiZXhwIjoyMDExMzA0NTA3fQ.sQmREUFOAqP5tclU1Uc3pGJtjYl3i7uQmgB82TSIXLI');

function findLatestHtmlFile(dirPath) {
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.html'));
    const sortedByDate = files.map(filename => ({
        name: filename,
        time: fs.statSync(path.join(dirPath, filename)).mtime.getTime()
    })).sort((a, b) => b.time - a.time);

    return sortedByDate.length ? sortedByDate[0].name : null;
}

function calcFromPairs(positivePairs) {
    let totalNet = 0;
    let totalVAT = 0;
    let totalBrutto = 0;

    positivePairs.forEach(pairs => {
        const brutto = Object.values(pairs)[0];
        const net = brutto / 1.23;
        const vat = brutto - net;
        totalNet += net;
        totalVAT += vat;
        totalBrutto += brutto;
    });

    return {
        totalNet: totalNet.toFixed(2),
        totalVAT: totalVAT.toFixed(2),
        totalBrutto: totalBrutto.toFixed(2),
        positivePairs 
    };
}

function calcFromNegativePairs(negativePairs, positivePairs) {
    let totalVATNegative = 0;
    let totalBruttoNegative = 0;
    let totalNettoNegative = 0;

    negativePairs.forEach(pair => {
        const bruttoNegative = Object.values(pair)[0];
        const netNegative = bruttoNegative / 1.23;
        const vatNegative = bruttoNegative - netNegative;
        totalVATNegative += vatNegative;
        totalBruttoNegative += bruttoNegative;
        totalNettoNegative += netNegative;
    });

    // Przekształcenie stringa na liczbę, aby wykonać operacje matematyczną
    var totalVATPositiveAccess = calcFromPairs(positivePairs); 
    var totalVATPositive = totalVATPositiveAccess.totalVAT;
    let totalVATNettoNegative = parseFloat(totalVATPositive) + totalVATNegative;
    let totalNewNettoNegative = parseFloat(totalNettoNegative);

    return {
        totalVATNegative: totalVATNegative.toFixed(2),
        totalBruttoNegative: totalBruttoNegative.toFixed(2),
        totalVATNettoNegative: totalVATNettoNegative.toFixed(2),
        totalNewNettoNegative: totalNewNettoNegative.toFixed(2)
    };
}

function countIncome(totalNetto, totalNettoNegative){
    // Konwersja ciągów znaków na liczby zmiennoprzecinkowe
    let totalNettoNum = parseFloat(totalNetto);
    let totalNettoNegativeNum = parseFloat(totalNettoNegative);
    
    // Dodawanie wartości liczbowych
    let totalIncome = totalNettoNum + totalNettoNegativeNum;
    return {totalIncome: totalIncome.toFixed(2)};
}

function parseHtmlAndExtractData(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(data);
    let pairs = [];
    let negPairs = [];

    $('table').eq(4).find('tr').slice(1).each(function() {
        const col2 = $(this).find('td').eq(1).text().trim();
        let col5 = $(this).find('td').eq(4).text().trim().replace('PLN', '').trim();
        col5 = col5.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
        const col5AsFloat = parseFloat(col5);

        if (!isNaN(col5AsFloat)) {
            if (col5AsFloat >= 0) {
                pairs.push({[col2]: col5AsFloat}); // Dodajemy do listy wartości dodatnich
            } else {
                negPairs.push({[col2]: col5AsFloat}); // Dodajemy do listy wartości ujemnych
            }
        }
    });

    // Teraz zwracamy obie listy
    return { positivePairs: pairs, negativePairs: negPairs };
}

function categories(filePath){
    const data = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(data);

    let bramka = [];
    let zaplaconyVat = [];
    let dochodowy =[];
    let subskrypcje =[];
    let czynsze = [];
    let uslugi = [];
    let wyplaty = [];
    

    $('table').eq(4).find('tr').slice(1).each(function() {
        const col2 = $(this).find('td').eq(1).text().trim();
        let col5 = $(this).find('td').eq(4).text().trim().replace('PLN', '').trim();
        col5 = col5.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
        const col5AsFloat = parseFloat(col5);
        const bramkaStrings = ['MELEMENTS'];
        const dochodowyStrings = ['URZĄD SKARBOWY'];
        const subskrypcjeStrings = ['AUTO-TUNE', 'YOUTUBE', 'THE MASTERS', 'SLATE', 'PLUGIN', 'DROPBOX', 'ADOBE', 'SPLICE', 'BENEFIT', 'UNIVERSAL AUDIO', 'PLAYSTATION', 'WAVES', 'HEROKU', 'VERCEL', 'MIRO', 'CHATGPT', 'SUPABASE', 'PADDLE.NET'];
        const czynszeStrings = ['LUKASIEWICZ', 'WOJSKOWA'];
        const uslugiStrings = ['P4 SP.', 'ABCGO', 'PIASTPOL', 'JUWENTUS', 'ORANGE'];
        const wyplatyStrings = ['ŁOŚ JONATAN', 'IWAN DOMINIK', 'CYBULSKI SZYMON', 'LITKOWIEC BRAJAN', 'PALARCZYK DOMINIK', 'DREWNIAK KORNELIUSZ', 'PAJDZIK WIKTOR', 'KRZEMIŃSKI SEBASTIAN', 'MICKIEWICZ PAWEŁ', 'ROZWADOWSKI JAKUB', 'MADEJ SANDRA', 'WRÓBLEWSKI ŁUKASZ', 'OSTROWSKI HUBERT', 'NOWICKI KAROL', 'KOWALCZYK MACIEJ', 'KAKIETEK MARIUSZ'];

        if (bramkaStrings.some(str => col2.includes(str)) && col5AsFloat >= 0) {
            bramka.push(col5AsFloat);
        } else if (dochodowyStrings.some(str => col2.includes(str)) && col5AsFloat <= 0) {
            dochodowy.push(col5AsFloat);
        } else if (subskrypcjeStrings.some(str => col2.includes(str)) && col5AsFloat <= 0) {
            subskrypcje.push(col5AsFloat);
        } else if (czynszeStrings.some(str => col2.includes(str)) && col5AsFloat <= 0) {
            czynsze.push(col5AsFloat);
        } else if (uslugiStrings.some(str => col2.includes(str)) && col5AsFloat <= 0) {
            uslugi.push(col5AsFloat);
        } else if (wyplatyStrings.some(str => col2.includes(str)) && col5AsFloat <= 0) {
            wyplaty.push(col5AsFloat);
        }
})

let allExp = {
    bramka,
    zaplaconyVat,
    dochodowy,
    subskrypcje,
    czynsze,
    uslugi,
    wyplaty
  };
  return allExp;
}

function sumExpensesByCategory(allExp) {
    let totalExpensesSum = {};
  
    // Iteracja przez kategorie w obiekcie allExp
    for (let category in allExp) {
      let categoryTotal = 0; // Suma dla bieżącej kategorii
  
      // Iteracja przez wydatki w danej kategorii
      for (let i = 0; i < allExp[category].length; i++) {
        const expense = allExp[category][i];
        expense.toFixed(2);
        categoryTotal += expense; // Dodawanie wartości wydatku do sumy kategorii
        parseFloat(categoryTotal);
    }
      totalExpensesSum[category] = categoryTotal.toFixed(2);
    }
  
    return totalExpensesSum; // Zwrócenie obiektu z sumami dla każdej kategorii
  }

async function processDocuments(directoryPath) {
    const files = fs.readdirSync(directoryPath);

    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        // Sprawdź, czy ścieżka jest plikiem
        if (fs.statSync(filePath).isFile()) {
            const htmlContent = fs.readFileSync(filePath, 'utf8');
            const $ = cheerio.load(htmlContent);
            const text = $('td > font').text();

            const regex = /za okres od (\d{4}-\d{2}-\d{2}) do (\d{4}-\d{2}-\d{2})/;
            const matches = regex.exec(text);
            if (matches[1] && matches[2]) {
                // Przygotowanie tekstu na nazwę pliku (zastąpienie lub usunięcie niedozwolonych znaków)
                const safeFileName1 = matches[1].replace(/[\/\\?%*:|"<>]/g, '_');
                const safeFileName2 = matches[2].replace(/[\/\\?%*:|"<>]/g, '_') + '.html';
                const fullFileName = safeFileName1 + ' - ' + safeFileName2;
                
                const newFilePath = path.join(directoryPath, fullFileName);

                // Zmiana nazwy pliku
                fs.renameSync(filePath, newFilePath);
                console.log(`Zmieniono nazwę pliku na: ${newFilePath}`);
            }

            if (matches[1] && matches[2]) {
                const startDate = new Date(matches[1]);
                const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1);

            if (matches[1] === startDate.toISOString().split('T')[0] && 
                text.includes(endDate.toISOString().split('T')[0])) {
                const newFileName = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}.html`;
                const newDirectoryPath = path.join(directoryPath, 'miesiace');
                if (!fs.existsSync(newDirectoryPath)) {
                    fs.mkdirSync(newDirectoryPath);
                }
                const newFilePath = path.join(newDirectoryPath, newFileName);
                if (!fs.existsSync(newFilePath)) {
                    fs.copyFileSync(filePath, newFilePath)
                    fs.unlinkSync(filePath);
                    console.log(`Przeniesiono plik ${file} do katalogu miesiace jako ${newFileName}`);
                } else {
                    fs.unlinkSync(filePath);
                    console.log(`Plik ${newFileName} już istnieje w katalogu miesiace. Pomijam.`);
                }
            }
        }}
    });
}


export const config = {
    api: {
      bodyParser: false, // Wyłączenie domyślnego parsowania body przez Next.js
    },
  };
  




export default async function handler(req, res) {
    try {
        const directoryPath = path.join(process.cwd(), 'Doks'); // Użyj process.cwd() dla ścieżki bezwzględnej
        const latestFile = findLatestHtmlFile(directoryPath);
        
        if (!latestFile) {
            return res.status(404).json({ message: 'Nie znaleziono najnowszego pliku HTML' });
        }

        const filePath = path.join(directoryPath, latestFile);
        const { positivePairs, negativePairs } = parseHtmlAndExtractData(filePath);
        const calcFromPairsResult = calcFromPairs(positivePairs);
        const calcFromNegativePairsResult = calcFromNegativePairs(negativePairs, positivePairs);
        const categoriesResults = categories(filePath);
        const totalIncome = countIncome(calcFromPairsResult.totalNet, calcFromNegativePairsResult.totalNewNettoNegative);
        const totalAllExp = categories(filePath);
        const totalExpensesCat = sumExpensesByCategory(totalAllExp);
        const processDocumentsResult = processDocuments(directoryPath);

        // Zwróć wyniki jako JSON
        res.status(200).json({ latestFile, processDocumentsResult, totalExpensesCat, calcFromPairsResult, calcFromNegativePairsResult, categoriesResults, totalIncome, totalAllExp });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
    
    
    

}

